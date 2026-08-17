/**
 * FormHandler - Main class
 * Handles all login form interactions
 */
import { ToastManager } from '../ToastManager.js';
import { authManager } from '../AuthManager.js';
import { SubmitHandler } from './handlers/submitHandler.js';
import { KeyboardHandler } from './handlers/keyboardHandler.js';
import { AuthHandler } from './handlers/authHandler.js';
import { ForgotPasswordModal } from './modals/forgotPasswordModal.js';
import { SignUpModal } from './modals/signUpModal.js';
import { loadRememberState, saveRememberState } from './utils/storage.js';
import { FORM_CONFIG } from './config.js';

export class FormHandler {
    #elements = {};
    #submitHandler;
    #keyboardHandler;
    #authHandler;
    #boundHandlers = {};
    #listeners = [];

    constructor(elements) {
        this.#elements = elements;
        this.#initHandlers();
        this.#bindEvents();
        this.#loadRememberState();
        authManager.addListener(this.#boundHandlers.onAuthChange);
    }

    #initHandlers() {
        this.#submitHandler = new SubmitHandler(this.#elements);
        this.#keyboardHandler = new KeyboardHandler(this.#elements, this.#submitHandler);
        this.#authHandler = new AuthHandler(FORM_CONFIG.REDIRECT_URL);

        this.#boundHandlers = {
            handleSubmit: this.#submitHandler.handleSubmit.bind(this.#submitHandler),
            handleKeyboard: this.#keyboardHandler.handleKeyboard.bind(this.#keyboardHandler),
            onAuthChange: this.#authHandler.onAuthChange.bind(this.#authHandler),
            handleForgotPassword: this.#handleForgotPassword.bind(this),
            handleSignUp: this.#handleSignUp.bind(this),
            handleRememberChange: this.#handleRememberChange.bind(this),
        };
    }

    // --- PUBLIC METHODS ---

    destroy() {
        this.#unbindEvents();
        authManager.removeListener(this.#boundHandlers.onAuthChange);
        this.#listeners = [];
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

    // --- MODAL HANDLERS (Private Methods) ---

    async #handleForgotPassword(e) {
        e.preventDefault();
        await ForgotPasswordModal.open();
    }

    async #handleSignUp(e) {
        e.preventDefault();
        await SignUpModal.open();
    }

    #handleRememberChange(e) {
        saveRememberState(e.target.checked);
    }

    #loadRememberState() {
        const checked = loadRememberState();
        this.#elements.rememberMe.checked = checked;
    }
}

// Factory function
export function createFormHandler(elements) {
    return new FormHandler(elements);
}
