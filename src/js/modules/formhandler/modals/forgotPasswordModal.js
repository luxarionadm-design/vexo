/**
 * Forgot Password Modal
 */
import { ModalManager } from '../ModalManager.js';
import { ToastManager } from '../ToastManager.js';
import { authManager } from '../AuthManager.js';
import { isValidEmail } from '../utils/validators.js';

export class ForgotPasswordModal {
    static MODAL_ID = 'forgotPassword';

    static async open() {
        const content = `
            <div style="margin-bottom: 16px; color: #999;">
                Enter your email address and we'll send you a link to reset your password.
            </div>
            <input type="email" id="resetEmail" placeholder="Enter your email" 
                   class="modal-input" style="width:100%; padding:10px; margin-bottom:12px; 
                   border:1px solid #333; background:#1a1a1a; color:#fff; border-radius:4px;" />
            <button class="btn-primary" id="sendResetBtn" 
                    style="width:100%; padding:12px; background:#f5c842; 
                    border:none; border-radius:4px; color:#000; font-weight:bold; cursor:pointer;">
                Send Reset Link
            </button>
        `;

        ModalManager.create(this.MODAL_ID, 'Reset Password', content);
        ModalManager.open(this.MODAL_ID);

        this.#bindEvents();
    }

    static #bindEvents() {
        const sendBtn = document.getElementById('sendResetBtn');
        const resetEmail = document.getElementById('resetEmail');

        const sendReset = async () => {
            const email = resetEmail.value.trim();

            if (!email || !isValidEmail(email)) {
                ToastManager.error('Please enter a valid email address');
                resetEmail.focus();
                return;
            }

            try {
                await authManager.resetPassword(email);
                ToastManager.success('Reset link sent to ' + email);
                ModalManager.close(this.MODAL_ID);
            } catch (error) {
                ToastManager.error(error.message || 'Failed to send reset link');
            }
        };

        sendBtn.addEventListener('click', sendReset);
        resetEmail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendReset();
            if (e.key === 'Escape') ModalManager.close(this.MODAL_ID);
        });
    }
}
