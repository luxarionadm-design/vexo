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
        
        // Debug: log initialization
        console.log('[FormHandler] Initialized');
        console.log('[FormHandler] Elements:', {
            forgotLink: !!elements.forgotLink,
            signupLink: !!elements.signupLink,
            form: !!elements.form,
        });
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

        // Form submit
        if (el.form) {
            el.form.addEventListener('submit', handlers.handleSubmit);
        }

        // Sign in button
        if (el.signinBtn) {
            el.signinBtn.addEventListener('click', handlers.handleSubmit);
        }

        // Remember me
        if (el.rememberMe) {
            el.rememberMe.addEventListener('change', handlers.handleRememberChange);
        }

        // FORGOT PASSWORD - Mobile friendly (click + touchstart)
        if (el.forgotLink) {
            el.forgotLink.addEventListener('click', handlers.handleForgotPassword);
            el.forgotLink.addEventListener('touchstart', handlers.handleForgotPassword, { passive: true });
            // Debug: log when link is clicked
            el.forgotLink.addEventListener('click', () => {
                console.log('[FormHandler] Forgot link clicked (click event)');
            });
            el.forgotLink.addEventListener('touchstart', () => {
                console.log('[FormHandler] Forgot link clicked (touchstart event)');
            });
        }

        // SIGN UP - Mobile friendly (click + touchstart)
        if (el.signupLink) {
            el.signupLink.addEventListener('click', handlers.handleSignUp);
            el.signupLink.addEventListener('touchstart', handlers.handleSignUp, { passive: true });
            // Debug: log when link is clicked
            el.signupLink.addEventListener('click', () => {
                console.log('[FormHandler] Signup link clicked (click event)');
            });
            el.signupLink.addEventListener('touchstart', () => {
                console.log('[FormHandler] Signup link clicked (touchstart event)');
            });
        }

        // Keyboard
        document.addEventListener('keydown', handlers.handleKeyboard);

        // Store listeners for cleanup
        this.#listeners = [];
        
        if (el.form) {
            this.#listeners.push({ element: el.form, type: 'submit', handler: handlers.handleSubmit });
        }
        if (el.signinBtn) {
            this.#listeners.push({ element: el.signinBtn, type: 'click', handler: handlers.handleSubmit });
        }
        if (el.rememberMe) {
            this.#listeners.push({ element: el.rememberMe, type: 'change', handler: handlers.handleRememberChange });
        }
        if (el.forgotLink) {
            this.#listeners.push({ element: el.forgotLink, type: 'click', handler: handlers.handleForgotPassword });
            this.#listeners.push({ element: el.forgotLink, type: 'touchstart', handler: handlers.handleForgotPassword });
        }
        if (el.signupLink) {
            this.#listeners.push({ element: el.signupLink, type: 'click', handler: handlers.handleSignUp });
            this.#listeners.push({ element: el.signupLink, type: 'touchstart', handler: handlers.handleSignUp });
        }
        this.#listeners.push({ element: document, type: 'keydown', handler: handlers.handleKeyboard });
    }

    #unbindEvents() {
        this.#listeners.forEach(({ element, type, handler }) => {
            if (element) {
                element.removeEventListener(type, handler);
            }
        });
    }

    // --- MODAL HANDLERS (Private Methods) ---

    async #handleForgotPassword(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[FormHandler] #handleForgotPassword called');
        
        // Check if ModalManager is available
        if (typeof ForgotPasswordModal === 'undefined' || !ForgotPasswordModal.open) {
            console.error('[FormHandler] ForgotPasswordModal not available');
            ToastManager.error('Modal system not ready. Please refresh.');
            return;
        }

        try {
            await ForgotPasswordModal.open();
            console.log('[FormHandler] ForgotPasswordModal opened successfully');
        } catch (error) {
            console.error('[FormHandler] ForgotPasswordModal error:', error);
            ToastManager.error('Failed to open reset password modal');
        }
    }

    async #handleSignUp(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[FormHandler] #handleSignUp called');
        
        if (typeof SignUpModal === 'undefined' || !SignUpModal.open) {
            console.error('[FormHandler] SignUpModal not available');
            ToastManager.error('Modal system not ready. Please refresh.');
            return;
        }

        try {
            await SignUpModal.open();
            console.log('[FormHandler] SignUpModal opened successfully');
        } catch (error) {
            console.error('[FormHandler] SignUpModal error:', error);
            ToastManager.error('Failed to open sign up modal');
        }
    }

    #handleRememberChange(e) {
        saveRememberState(e.target.checked);
    }

    #loadRememberState() {
        const checked = loadRememberState();
        if (this.#elements.rememberMe) {
            this.#elements.rememberMe.checked = checked;
        }
    }
}

// Factory function
export function createFormHandler(elements) {
    return new FormHandler(elements);
}
