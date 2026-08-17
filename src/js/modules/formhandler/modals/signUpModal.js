/**
 * Sign Up Modal
 */
import { ModalManager } from '../ModalManager.js';
import { ToastManager } from '../ToastManager.js';
import { authManager } from '../AuthManager.js';
import { isValidEmail, isValidPassword } from '../utils/validators.js';
import { FORM_CONFIG } from '../config.js';

export class SignUpModal {
    static MODAL_ID = 'signup';

    static async open() {
        const content = `
            <div style="margin-bottom: 16px; color: #999;">
                Create your Vexorion account and start streaming in 4K UHD HDR.
            </div>
            <input type="text" id="signupName" placeholder="Full name" 
                   class="modal-input" style="width:100%; padding:10px; margin-bottom:12px; 
                   border:1px solid #333; background:#1a1a1a; color:#fff; border-radius:4px;" />
            <input type="email" id="signupEmail" placeholder="Email address" 
                   class="modal-input" style="width:100%; padding:10px; margin-bottom:12px; 
                   border:1px solid #333; background:#1a1a1a; color:#fff; border-radius:4px;" />
            <input type="password" id="signupPassword" placeholder="Password (min 6 characters)" 
                   class="modal-input" style="width:100%; padding:10px; margin-bottom:12px; 
                   border:1px solid #333; background:#1a1a1a; color:#fff; border-radius:4px;" />
            <button class="btn-primary" id="signupSubmitBtn" 
                    style="width:100%; padding:12px; background:#f5c842; 
                    border:none; border-radius:4px; color:#000; font-weight:bold; cursor:pointer;">
                Create Account
            </button>
        `;

        ModalManager.create(this.MODAL_ID, 'Create Account', content);
        ModalManager.open(this.MODAL_ID);

        this.#bindEvents();
    }

    static #bindEvents() {
        const submitBtn = document.getElementById('signupSubmitBtn');
        const nameInput = document.getElementById('signupName');
        const emailInput = document.getElementById('signupEmail');
        const passwordInput = document.getElementById('signupPassword');

        const handleSubmit = async () => {
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!name || !email || !password) {
                ToastManager.error('Please fill in all fields');
                return;
            }

            if (!isValidEmail(email)) {
                ToastManager.error('Please enter a valid email address');
                emailInput.focus();
                return;
            }

            if (!isValidPassword(password)) {
                ToastManager.error(`Password must be at least ${FORM_CONFIG.MIN_PASSWORD_LENGTH} characters`);
                passwordInput.focus();
                return;
            }

            try {
                const response = await authManager.register({
                    name,
                    email,
                    username: email.split('@')[0],
                    password
                });

                ModalManager.close(this.MODAL_ID);
                await this.#showSuccessModal(response.user.name);

                setTimeout(() => {
                    ModalManager.close('success');
                    window.location.href = FORM_CONFIG.REDIRECT_URL;
                }, 3000);

            } catch (error) {
                ToastManager.error(error.message || 'Registration failed');
            }
        };

        submitBtn.addEventListener('click', handleSubmit);

        [nameInput, emailInput, passwordInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') ModalManager.close(this.MODAL_ID);
            });
        });
    }

    static async #showSuccessModal(name) {
        const content = `
            <div style="text-align: center; padding: 10px 0;">
                <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                <h3 style="color: #f5c842; margin-bottom: 8px;">Account Created!</h3>
                <p style="color: #999;">Welcome to Vexorion, ${name}!</p>
                <button onclick="document.getElementById('vexor-modal-success').style.display='none'" 
                        style="margin-top:16px; padding:10px 30px; background:#f5c842; 
                        border:none; border-radius:4px; color:#000; font-weight:bold; cursor:pointer;">
                    Get Started
                </button>
            </div>
        `;

        ModalManager.create('success', '🎉 Success!', content);
        ModalManager.open('success');
    }
}
