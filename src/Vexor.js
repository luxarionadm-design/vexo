import { modalManager } from './js/modules/ModalManager.js';
import { toastManager } from './js/modules/ToastManager.js';
import { authManager } from './js/modules/AuthManager.js';
import { createFormHandler } from './js/modules/formhandler/index.js';

export class VexorApp {
    #elements = {};
    #formHandler = null;
    #initialized = false;

    constructor() {
        // Minimal setup di constructor
    }

    // ===== PUBLIC API =====
    init() {
        if (this.#initialized) return;
        this.#cacheElements();
        this.#loadInitialState();
        this.#setupFormHandler();
        this.#setupGlobalListeners();
        this.#initialized = true;
        console.log('[Vexorion] App initialized');
    }

    destroy() {
        if (this.#formHandler) {
            this.#formHandler.destroy();
            this.#formHandler = null;
        }
        this.#removeGlobalListeners();
        this.#initialized = false;
    }

    getElements() {
        return { ...this.#elements };
    }

    // ===== PRIVATE METHODS =====
    #cacheElements() {
        this.#elements = {
            form: document.getElementById('loginForm'),
            email: document.getElementById('emailInput'),
            password: document.getElementById('passwordInput'),
            signinBtn: document.getElementById('signinBtn'),
            rememberMe: document.getElementById('rememberCheck'),
            forgotLink: document.getElementById('forgotLink'),
            signupLink: document.getElementById('signupLink'),
            container: document.querySelector('.login-container')
        };
    }

    #loadInitialState() {
        const state = authManager.getState();
        if (state.isLoggedIn && state.user) {
            this.#elements.email.value = state.user.email || '';
            toastManager.success(`Welcome back, ${state.user.name || state.user.email}!`);
            this.#redirectToDashboard();
        }
    }

    #setupFormHandler() {
        this.#formHandler = createFormHandler(this.#elements);
    }

    #setupGlobalListeners() {
        window.addEventListener('online', () => {
            toastManager.success('Back online!');
        });
        window.addEventListener('offline', () => {
            toastManager.error('You are offline. Please check your connection.');
        });
    }

    #removeGlobalListeners() {
        // Cleanup listeners
    }

    #redirectToDashboard() {
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
    }
}

// ===== EXPORT CLASS =====
export { VexorApp };
export { modalManager };
export { toastManager };
export { authManager };
export { createFormHandler };

export * from './js/modules/ModalManager.js';
export * from './js/modules/ToastManager.js';
export * from './js/modules/AuthManager.js';
export * from './js/modules/formhandler/index.js';
