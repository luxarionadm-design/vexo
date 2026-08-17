/**
 * FormHandler - Handles all login form interactions
 */
import { ToastManager } from './ToastManager.js';
import { ModalManager } from './ModalManager.js';
import { authManager } from './AuthManager.js';

class FormHandler {
    #elements = {};
    #isSubmitting = false;
    #listeners = [];
    #boundHandlers = {};

    constructor(elements) {
        this.#elements = elements;
        this.#boundHandlers = {
            handleSubmit: this.#handleSubmit.bind(this),
            handleRememberChange: this.#handleRememberChange.bind(this),
            handleForgotPassword: this.#handleForgotPassword.bind(this),
            handleSignUp: this.#handleSignUp.bind(this),
            handleKeyboard: this.#handleKeyboard.bind(this),
            onAuthChange: this.#onAuthChange.bind(this)
        };
        this.#bindEvents();
        this.#loadRememberState();
        authManager.addListener(this.#boundHandlers.onAuthChange);
    }

    // --- PUBLIC METHODS ---

    destroy() {
        this.#unbindEvents();
        authManager.removeListener(this.#boundHandlers.onAuthChange);
        this.#listeners = [];
        this.#boundHandlers = null;
    }

    fillDemoCredentials() {
        const el = this.#elements;
        el.email.value = 'demo@vexorion.com';
        el.password.value = 'demo123';
        ToastManager.info('Demo credentials loaded');
    }

    // --- PRIVATE METHODS ---

    #bindEvents() {
        const el = this.#elements;
        const handlers = this.#boundHandlers;

        el.form.addEventListener('submit', handlers.handleSubmit);
        el.signinBtn.addEventListener('click', handlers.handleSubmit);
        el.rememberMe.addEventListener('change', handlers.handleRememberChange);
        el.forgotLink.addEventListener('click', handlers.handleForgotPassword);
        el.signupLink.addEventListener('click', handlers.handleSignUp);
        document.addEventListener('keydown', handlers.handleKeyboard);

        this.#listeners = [
            { element: el.form, type: 'submit', handler: handlers.handleSubmit },
            { element: el.signinBtn, type: 'click', handler: handlers.handleSubmit },
            { element: el.rememberMe, type: 'change', handler: handlers.handleRememberChange },
            { element: el.forgotLink, type: 'click', handler: handlers.handleForgotPassword },
            { element: el.signupLink, type: 'click', handler: handlers.handleSignUp },
            { element: document, type: 'keydown', handler: handlers.handleKeyboard }
        ];
    }

    #unbindEvents() {
        this.#listeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
    }

    async #handleSubmit(e) {
        e.preventDefault();
        await this.#processLogin();
    }

    async #processLogin() {
        if (this.#isSubmitting) return;
        
        const el = this.#elements;
        const email = el.email.value.trim();
        const password = el.password.value.trim();

        if (!email || !password) {
            ToastManager.error('Please fill in all fields');
            el.email.focus();
            return;
        }

        if (!this.#isValidEmail(email)) {
            ToastManager.error('Please enter a valid email address');
            el.email.focus();
            return;
        }

        this.#setLoading(true);

        try {
            const response = await authManager.login(email, password);
            ToastManager.success(`Welcome back, ${response.user.name || response.user.email}!`);
            this.#handleLoginSuccess();
        } catch (error) {
            ToastManager.error(error.message || 'Login failed. Please try again.');
            el.password.value = '';
            el.password.focus();
        } finally {
            this.#setLoading(false);
        }
    }

    #handleLoginSuccess() {
        const el = this.#elements;
        el.form.style.opacity = '0.6';
        el.form.style.pointerEvents = 'none';
        el.container.style.borderColor = 'rgba(245, 200, 66, 0.3)';
        el.container.style.transition = 'all 0.5s ease';
        el.container.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            el.form.style.opacity = '1';
            el.form.style.pointerEvents = 'auto';
            el.container.style.borderColor = '';
            el.container.style.transform = 'scale(1)';
            el.password.value = '';
            window.location.href = '/dashboard.html';
        }, 2000);
    }

    #setLoading(isLoading) {
        this.#isSubmitting = isLoading;
        const el = this.#elements;
        el.signinBtn.textContent = isLoading ? 'Signing in...' : 'Sign in';
        el.signinBtn.disabled = isLoading;
    }

    #handleRememberChange(e) {
        this.#saveRememberState(e.target.checked);
    }

    #saveRememberState(checked) {
        try {
            localStorage.setItem('vexor_remember', JSON.stringify(checked));
        } catch (error) {
            console.error('[FormHandler] Save remember error:', error);
        }
    }

    #loadRememberState() {
        try {
            const saved = localStorage.getItem('vexor_remember');
            if (saved) {
                const checked = JSON.parse(saved);
                this.#elements.rememberMe.checked = checked;
            }
        } catch (error) {
            console.error('[FormHandler] Load remember error:', error);
        }
    }

    #isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    #onAuthChange(state) {
        if (state.isLoggedIn) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/dashboard.html' && !currentPath.includes('dashboard')) {
                window.location.href = '/dashboard.html';
            }
        }
    }

    // --- MODAL HANDLERS ---

    async #handleForgotPassword(e) {
        e.preventDefault();
        const modalId = 'forgotPassword';
        
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
        
        ModalManager.create(modalId, 'Reset Password', content);
        ModalManager.open(modalId);

        const sendBtn = document.getElementById('sendResetBtn');
        const resetEmail = document.getElementById('resetEmail');
        
        const sendReset = async () => {
            const email = resetEmail.value.trim();
            if (!email) {
                ToastManager.error('Please enter your email address');
                resetEmail.focus();
                return;
            }
            if (!this.#isValidEmail(email)) {
                ToastManager.error('Please enter a valid email address');
                resetEmail.focus();
                return;
            }

            try {
                await authManager.resetPassword(email);
                ToastManager.success('Reset link sent to ' + email);
                ModalManager.close(modalId);
            } catch (error) {
                ToastManager.error(error.message || 'Failed to send reset link');
            }
        };

        sendBtn.addEventListener('click', sendReset);
        resetEmail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendReset();
            if (e.key === 'Escape') ModalManager.close(modalId);
        });
    }

    async #handleSignUp(e) {
        e.preventDefault();
        const modalId = 'signup';
        
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
        
        ModalManager.create(modalId, 'Create Account', content);
        ModalManager.open(modalId);

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
            if (!this.#isValidEmail(email)) {
                ToastManager.error('Please enter a valid email address');
                emailInput.focus();
                return;
            }
            if (password.length < 6) {
                ToastManager.error('Password must be at least 6 characters');
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
                
                ModalManager.close(modalId);
                ModalManager.create('success', '🎉 Success!', `
                    <div style="text-align: center; padding: 10px 0;">
                        <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                        <h3 style="color: #f5c842; margin-bottom: 8px;">Account Created!</h3>
                        <p style="color: #999;">Welcome to Vexorion, ${response.user.name}!</p>
                        <button onclick="document.getElementById('vexor-modal-success').style.display='none'" 
                                style="margin-top:16px; padding:10px 30px; background:#f5c842; 
                                border:none; border-radius:4px; color:#000; font-weight:bold; cursor:pointer;">
                            Get Started
                        </button>
                    </div>
                `);
                ModalManager.open('success');
                
                setTimeout(() => {
                    ModalManager.close('success');
                    window.location.href = '/dashboard.html';
                }, 3000);
                
            } catch (error) {
                ToastManager.error(error.message || 'Registration failed. Please try again.');
            }
        };

        submitBtn.addEventListener('click', handleSubmit);
        
        [nameInput, emailInput, passwordInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') ModalManager.close(modalId);
            });
        });
    }

    #handleKeyboard(e) {
        // Ctrl+D for demo credentials
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            this.fillDemoCredentials();
        }
        
        // Enter on form
        if (e.key === 'Enter') {
            const active = document.activeElement;
            const el = this.#elements;
            if (active === el.email || active === el.password) {
                e.preventDefault();
                this.#processLogin();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            ModalManager.closeAll();
        }
    }
}

// Factory function
export function createFormHandler(elements) {
    return new FormHandler(elements);
}
