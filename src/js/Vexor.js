import { ToastManager } from './modules/ToastManager.js';
import { ModalManager } from './modules/ModalManager.js';
import { FormHandler } from './modules/FormHandler.js';
import { AuthManager } from './modules/AuthManager.js';

class VexorApp {
    constructor() {
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.loadState();
        FormHandler.init(this.elements);
        this.log('Vexorion App initialized');
    }

    cacheElements() {
        this.elements = {
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

    loadState() {
        const auth = AuthManager.loadState();
        if (auth && auth.isLoggedIn && auth.user) {
            this.elements.email.value = auth.user.email || '';
            ToastManager.success('Welcome back, ' + auth.user.email + '!');
        }
        FormHandler.loadRememberState();
    }

    log(...args) {
        console.log('[Vexorion]', ...args);
    }
}

const app = new VexorApp();

export { app, ToastManager, ModalManager, FormHandler, AuthManager };
