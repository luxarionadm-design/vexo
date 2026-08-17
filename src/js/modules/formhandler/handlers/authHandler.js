/**
 * Auth change handler
 */
export class AuthHandler {
    #redirectUrl;

    constructor(redirectUrl = '/dashboard.html') {
        this.#redirectUrl = redirectUrl;
    }

    onAuthChange(state) {
        if (state.isLoggedIn) {
            const currentPath = window.location.pathname;
            if (currentPath !== this.#redirectUrl && !currentPath.includes('dashboard')) {
                window.location.href = this.#redirectUrl;
            }
        }
    }
}
