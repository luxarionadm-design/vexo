/**
 * AuthManager - Manages authentication state
 * @singleton - Use same instance across app
 */
import { apiService } from './ApiService.js';

class AuthManager {
    static #instance = null;
    #state = {
        isLoggedIn: false,
        user: null,
        token: null
    };
    #listeners = [];

    constructor() {
        if (AuthManager.#instance) {
            return AuthManager.#instance;
        }
        AuthManager.#instance = this;
        this.#loadState();
        this.#setupStorageSync();
    }

    static getInstance() {
        if (!AuthManager.#instance) {
            AuthManager.#instance = new AuthManager();
        }
        return AuthManager.#instance;
    }

    // --- PUBLIC METHODS ---

    async login(email, password) {
        try {
            const response = await apiService.login(email, password);
            this.#setAuthState(response.user, response.token);
            return response;
        } catch (error) {
            this.#logout();
            throw new Error(error.message);
        }
    }

    async register(userData) {
        try {
            const response = await apiService.register(userData);
            this.#setAuthState(response.user, response.token);
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async resetPassword(email) {
        try {
            return await apiService.resetPassword(email);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async logout() {
        try {
            await apiService.signOut();
        } catch (error) {
            console.error('[AuthManager] Logout error:', error);
        }
        this.#logout();
    }

    isAuthenticated() {
        return this.#state.isLoggedIn && !!this.#state.token;
    }

    getUser() {
        return this.#state.user ? { ...this.#state.user } : null;
    }

    getToken() {
        return this.#state.token;
    }

    async checkAuth() {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            const user = await apiService.getCurrentUser();
            if (user) {
                this.#state.user = user;
                this.#saveState();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[AuthManager] Auth check failed:', error);
            this.#logout();
            return false;
        }
    }

    // --- EVENT LISTENERS ---

    addListener(callback) {
        if (typeof callback === 'function') {
            this.#listeners.push(callback);
        }
    }

    removeListener(callback) {
        this.#listeners = this.#listeners.filter(cb => cb !== callback);
    }

    // --- PRIVATE METHODS ---

    #setAuthState(user, token) {
        this.#state.isLoggedIn = true;
        this.#state.user = { ...user };
        this.#state.token = token;
        this.#saveState();
        this.#notifyListeners();
    }

    #logout() {
        this.#state.isLoggedIn = false;
        this.#state.user = null;
        this.#state.token = null;
        this.#saveState();
        this.#notifyListeners();
        apiService.clearToken();
    }

    #saveState = this.#debounce(() => {
        try {
            const data = {
                isLoggedIn: this.#state.isLoggedIn,
                user: this.#state.user,
                token: this.#state.token,
                timestamp: Date.now()
            };
            localStorage.setItem('vexor_auth', JSON.stringify(data));
            
            if (this.#state.token) {
                apiService.setToken(this.#state.token);
            }
        } catch (error) {
            console.error('[AuthManager] Save state error:', error);
        }
    }, 300);

    #loadState() {
        try {
            const raw = localStorage.getItem('vexor_auth');
            if (raw) {
                const data = JSON.parse(raw);
                this.#state.isLoggedIn = data.isLoggedIn || false;
                this.#state.user = data.user || null;
                this.#state.token = data.token || null;
                
                if (data.token) {
                    apiService.setToken(data.token);
                }
            }
        } catch (error) {
            console.error('[AuthManager] Load state error:', error);
            this.#logout();
        }
    }

    #setupStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'vexor_auth' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    this.#state.isLoggedIn = data.isLoggedIn || false;
                    this.#state.user = data.user || null;
                    this.#state.token = data.token || null;
                    this.#notifyListeners();
                } catch (error) {
                    console.error('[AuthManager] Storage sync error:', error);
                }
            }
        });
    }

    #notifyListeners() {
        const state = this.getState();
        this.#listeners.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('[AuthManager] Listener error:', error);
            }
        });
    }

    #debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // --- PUBLIC GETTER ---

    getState() {
        return {
            isLoggedIn: this.#state.isLoggedIn,
            user: this.#state.user ? { ...this.#state.user } : null,
            token: this.#state.token
        };
    }
}

// Export single instance
export const authManager = AuthManager.getInstance();
