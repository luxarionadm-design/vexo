/**
 * VexorApp - Main entry point
 * @singleton
 */
import { modalManager } from './js/modules/ModalManager.js';
import { toastManager } from './js/modules/ToastManager.js';
import { authManager } from './js/modules/AuthManager.js';
import { createFormHandler } from './js/modules/FormHandler.js';

class VexorApp {
    static #instance = null;
    #elements = {};
    #formHandler = null;
    #initialized = false;
    #initPromise = null;

    constructor() {
        if (VexorApp.#instance) {
            return VexorApp.#instance;
        }
        VexorApp.#instance = this;
    }

    static getInstance() {
        if (!VexorApp.#instance) {
            VexorApp.#instance = new VexorApp();
        }
        return VexorApp.#instance;
    }

    // --- PUBLIC METHODS ---

    async init() {
        if (this.#initialized) {
            return this.#initPromise;
        }

        if (this.#initPromise) {
            return this.#initPromise;
        }

        this.#initPromise = this.#initialize();
        return this.#initPromise;
    }

    async #initialize() {
        try {
            this.#cacheElements();
            await this.#loadInitialState();
            this.#setupFormHandler();
            this.#setupGlobalListeners();
            
            this.#initialized = true;
            this.#log('Vexorion App initialized');
            return true;
        } catch (error) {
            console.error('[Vexorion] Init failed:', error);
            throw error;
        }
    }

    destroy() {
        if (this.#formHandler) {
            this.#formHandler.destroy();
        }
        this.#removeGlobalListeners();
        this.#initialized = false;
        this.#log('Vexorion App destroyed');
    }

    restart() {
        this.destroy();
        return this.init();
    }

    getElements() {
        return { ...this.#elements };
    }

    // --- PRIVATE METHODS ---

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

        Object.entries(this.#elements).forEach(([key, value]) => {
            if (!value) {
                console.warn(`[Vexorion] Element "#${key}" not found`);
            }
        });
    }

    async #loadInitialState() {
        const isAuthenticated = await authManager.checkAuth();
        const state = authManager.getState();
        
        if (isAuthenticated && state.user) {
            this.#elements.email.value = state.user.email || '';
            toastManager.success(`Welcome back, ${state.user.name || state.user.email}!`);
            if (window.location.pathname === '/') {
                this.#redirectToDashboard();
            }
        }
    }

    #setupFormHandler() {
        this.#formHandler = createFormHandler(this.#elements);
    }

    #setupGlobalListeners() {
        this.#networkOnlineHandler = () => {
            toastManager.success('Back online!');
        };
        this.#networkOfflineHandler = () => {
            toastManager.error('You are offline. Please check your connection.');
        };

        window.addEventListener('online', this.#networkOnlineHandler);
        window.addEventListener('offline', this.#networkOfflineHandler);

        this.#unhandledRejectionHandler = (event) => {
            console.error('[Vexorion] Unhandled Promise Rejection:', event.reason);
            toastManager.error('An unexpected error occurred. Please try again.');
        };
        window.addEventListener('unhandledrejection', this.#unhandledRejectionHandler);

        this.#visibilityHandler = () => {
            if (document.hidden) {
                this.#log('Page hidden - saving state');
            }
        };
        document.addEventListener('visibilitychange', this.#visibilityHandler);
    }

    #removeGlobalListeners() {
        window.removeEventListener('online', this.#networkOnlineHandler);
        window.removeEventListener('offline', this.#networkOfflineHandler);
        window.removeEventListener('unhandledrejection', this.#unhandledRejectionHandler);
        document.removeEventListener('visibilitychange', this.#visibilityHandler);
    }

    #redirectToDashboard() {
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
    }

    #log(...args) {
        console.log('[Vexorion]', ...args);
    }
}

// Initialize app
const app = VexorApp.getInstance();

function whenReady() {
    return new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

whenReady().then(() => {
    app.init().catch(error => {
        console.error('[Vexorion] Failed to initialize:', error);
    });
});

// Export
export { 
    app,
    modalManager as ModalManager,
    toastManager as ToastManager,
    authManager as AuthManager
};
