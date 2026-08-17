/**
 * Submit handler
 */
import { ToastManager } from '../ToastManager.js';
import { authManager } from '../AuthManager.js';
import { isFormValid } from '../utils/validators.js';
import { FORM_CONFIG } from '../config.js';

export class SubmitHandler {
    #elements;
    #isSubmitting = false;

    constructor(elements) {
        this.#elements = elements;
    }

    async handleSubmit(e) {
        e.preventDefault();
        await this.#processLogin();
    }

    async #processLogin() {
        if (this.#isSubmitting) return;

        const el = this.#elements;
        const email = el.email.value.trim();
        const password = el.password.value.trim();

        if (!isFormValid(email, password)) {
            ToastManager.error('Please enter a valid email and password');
            el.email.focus();
            return;
        }

        this.#setLoading(true);

        try {
            const response = await authManager.login(email, password);
            ToastManager.success(`Welcome back, ${response.user.name || response.user.email}!`);
            this.#handleLoginSuccess();
        } catch (error) {
            ToastManager.error(error.message || 'Login failed');
            el.password.value = '';
            el.password.focus();
        } finally {
            this.#setLoading(false);
        }
    }

    #handleLoginSuccess() {
        const el = this.#elements;
        el.container.style.transition = 'all 0.5s ease';
        el.container.style.transform = 'scale(0.98)';

        setTimeout(() => {
            el.container.style.transform = 'scale(1)';
            window.location.href = FORM_CONFIG.REDIRECT_URL;
        }, 1500);
    }

    #setLoading(isLoading) {
        this.#isSubmitting = isLoading;
        const el = this.#elements;
        el.signinBtn.textContent = isLoading ? 'Signing in...' : 'Sign in';
        el.signinBtn.disabled = isLoading;
    }
}
