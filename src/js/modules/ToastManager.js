/**
 * ToastManager - Displays notifications
 * @singleton
 */
class ToastManager {
    static #instance = null;
    #queue = [];
    #isShowing = false;
    #defaultDuration = 3000;
    #container = null;
    #maxToasts = 5;

    constructor() {
        if (ToastManager.#instance) {
            return ToastManager.#instance;
        }
        ToastManager.#instance = this;
        this.#createContainer();
    }

    static getInstance() {
        if (!ToastManager.#instance) {
            ToastManager.#instance = new ToastManager();
        }
        return ToastManager.#instance;
    }

    // --- PUBLIC METHODS ---

    show(message, type = 'info', duration = this.#defaultDuration) {
        if (!message) return;
        this.#queue.push({ message, type, duration });
        if (!this.#isShowing) {
            this.#processQueue();
        }
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    clear() {
        this.#queue = [];
        this.#isShowing = false;
        if (this.#container) {
            this.#container.innerHTML = '';
        }
    }

    setDefaultDuration(duration) {
        if (duration > 0) {
            this.#defaultDuration = duration;
        }
    }

    setMaxToasts(max) {
        if (max > 0) {
            this.#maxToasts = max;
        }
    }

    // --- PRIVATE METHODS ---

    #createContainer() {
        const old = document.querySelector('.vexor-toast-container');
        if (old) old.remove();

        this.#container = document.createElement('div');
        this.#container.className = 'vexor-toast-container';
        this.#container.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            pointer-events: none;
            max-width: 90%;
        `;
        document.body.appendChild(this.#container);
    }

    #processQueue() {
        if (this.#queue.length === 0) {
            this.#isShowing = false;
            return;
        }

        const batch = this.#queue.splice(0, this.#maxToasts);
        this.#isShowing = true;

        batch.forEach((toast, index) => {
            setTimeout(() => {
                this.#renderToast(toast);
            }, index * 100);
        });

        const totalDuration = batch.reduce((max, t) => Math.max(max, t.duration), 0);
        setTimeout(() => {
            this.#clearAllToasts();
            this.#isShowing = false;
            this.#processQueue();
        }, totalDuration + 500);
    }

    #clearAllToasts() {
        if (this.#container) {
            this.#container.innerHTML = '';
        }
    }

    #renderToast({ message, type }) {
        if (!this.#container) return;

        const toast = document.createElement('div');
        toast.className = 'vexor-toast';
        
        const config = {
            success: { color: '#4caf50', icon: '✓' },
            error: { color: '#e50914', icon: '✕' },
            info: { color: '#f5c842', icon: 'ℹ' },
            warning: { color: '#ff9800', icon: '⚠' }
        };

        const style = config[type] || config.info;
        
        toast.style.cssText = `
            padding: 14px 28px;
            border-radius: 8px;
            background: #1a1a1a;
            color: #fff;
            font-size: 15px;
            font-weight: 500;
            border-left: 4px solid ${style.color};
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
            pointer-events: auto;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            text-align: center;
            min-width: 200px;
            max-width: 500px;
        `;
        
        toast.innerHTML = `<span style="margin-right: 8px;">${style.icon}</span> ${message}`;
        this.#container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
    }
}

// Export single instance
export const toastManager = ToastManager.getInstance();

// For backward compatibility
export const ToastManager = {
    show: (message, type, duration) => toastManager.show(message, type, duration),
    success: (message, duration) => toastManager.success(message, duration),
    error: (message, duration) => toastManager.error(message, duration),
    info: (message, duration) => toastManager.info(message, duration),
    warning: (message, duration) => toastManager.warning(message, duration),
    clear: () => toastManager.clear(),
    setDefaultDuration: (duration) => toastManager.setDefaultDuration(duration)
};
