/**
 * Keyboard handler
 */
import { ModalManager } from '../ModalManager.js';
import { ToastManager } from '../ToastManager.js';
import { FORM_CONFIG } from '../config.js';

export class KeyboardHandler {
    #elements;
    #submitHandler;

    constructor(elements, submitHandler) {
        this.#elements = elements;
        this.#submitHandler = submitHandler;
    }

    handleKeyboard(e) {
        // Ctrl+D for demo credentials
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            this.#fillDemoCredentials();
            return;
        }

        // Enter on form
        if (e.key === 'Enter') {
            const active = document.activeElement;
            const el = this.#elements;
            if (active === el.email || active === el.password) {
                e.preventDefault();
                this.#submitHandler.handleSubmit(e);
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            ModalManager.closeAll();
        }
    }

    #fillDemoCredentials() {
        const el = this.#elements;
        el.email.value = FORM_CONFIG.DEMO_EMAIL;
        el.password.value = FORM_CONFIG.DEMO_PASSWORD;
        ToastManager.info('Demo credentials loaded');
    }
}
