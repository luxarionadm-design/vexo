/**
 * ModalManager - Manages all modal dialogs
 * @singleton
 */
class ModalManager {
    static #instance = null;
    #modals = new Map();
    #activeModals = [];
    #focusableElements = [];
    #firstFocusable = null;
    #lastFocusable = null;

    constructor() {
        if (ModalManager.#instance) {
            return ModalManager.#instance;
        }
        ModalManager.#instance = this;
        this.#setupEscapeHandler();
    }

    static getInstance() {
        if (!ModalManager.#instance) {
            ModalManager.#instance = new ModalManager();
        }
        return ModalManager.#instance;
    }

    // --- PUBLIC METHODS ---

    create(id, title, content, options = {}) {
        this.#removeModal(id);

        const modal = document.createElement('div');
        modal.id = `vexor-modal-${id}`;
        modal.className = 'vexor-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: ${9998 + this.#modals.size + 1};
            padding: 20px;
            backdrop-filter: blur(4px);
        `;

        const box = document.createElement('div');
        box.className = 'vexor-modal-box';
        box.style.cssText = `
            background: #151515;
            border-radius: 12px;
            width: 100%;
            max-width: ${options.width || '500px'};
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid #2a2a2a;
            animation: modalSlideIn 0.3s ease;
        `;

        // Header
        const header = document.createElement('div');
        header.className = 'vexor-modal-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #2a2a2a;
        `;

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #f5c842;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'vexor-modal-close';
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #666;
            font-size: 24px;
            cursor: pointer;
            padding: 4px 8px;
            transition: color 0.2s;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = '#fff';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#666';
        });
        closeBtn.addEventListener('click', () => {
            this.close(id);
        });

        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        // Body
        const body = document.createElement('div');
        body.className = 'vexor-modal-body';
        body.style.cssText = 'padding: 24px;';
        body.innerHTML = content;

        body.querySelectorAll('input, textarea, select').forEach(el => {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close(id);
                }
            });
        });

        box.appendChild(header);
        box.appendChild(body);
        modal.appendChild(box);

        if (options.closeOnBackdrop !== false) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(id);
                }
            });
        }

        if (!document.querySelector('#modal-keyframes')) {
            const style = document.createElement('style');
            style.id = 'modal-keyframes';
            style.textContent = `
                @keyframes modalSlideIn {
                    from {
                        transform: translateY(20px) scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
        this.#modals.set(id, { 
            element: modal, 
            options,
            isOpen: false 
        });

        return modal;
    }

    open(id) {
        const modal = this.#modals.get(id);
        if (!modal) return;

        modal.element.style.display = 'flex';
        modal.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.#activeModals.push(id);

        this.#setupFocusTrap(modal.element);
        this.#focusFirstElement(modal.element);
    }

    close(id) {
        const modal = this.#modals.get(id);
        if (!modal) return;

        modal.element.style.display = 'none';
        modal.isOpen = false;
        this.#activeModals = this.#activeModals.filter(mId => mId !== id);

        modal.element.removeEventListener('keydown', this.#trapFocus);

        if (this.#activeModals.length === 0) {
            document.body.style.overflow = '';
            this.#restoreFocus();
        }
    }

    closeAll() {
        this.#modals.forEach((modal, id) => {
            modal.element.style.display = 'none';
            modal.isOpen = false;
        });
        this.#activeModals = [];
        document.body.style.overflow = '';
    }

    isOpen(id) {
        const modal = this.#modals.get(id);
        return modal && modal.isOpen;
    }

    updateContent(id, content) {
        const modal = this.#modals.get(id);
        if (modal) {
            const body = modal.element.querySelector('.vexor-modal-body');
            if (body) {
                body.innerHTML = content;
            }
        }
    }

    getActiveModals() {
        return [...this.#activeModals];
    }

    // --- HELPER MODALS ---

    showAlert(title, message, type = 'info') {
        const id = `alert-${Date.now()}`;
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const content = `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 48px; margin-bottom: 16px;">${icons[type] || 'ℹ️'}</div>
                <p style="color: #999; margin-bottom: 20px;">${message}</p>
                <button id="alertOkBtn" 
                        style="padding: 10px 30px; background: #f5c842; border: none; 
                        border-radius: 4px; color: #000; font-weight: bold; cursor: pointer;">
                    OK
                </button>
            </div>
        `;
        
        this.create(id, title, content, { closeOnBackdrop: false });
        this.open(id);

        document.getElementById('alertOkBtn').addEventListener('click', () => {
            this.close(id);
        });

        return id;
    }

    showConfirm(title, message, onConfirm, onCancel) {
        const id = `confirm-${Date.now()}`;
        const content = `
            <p style="color: #999; margin-bottom: 20px;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="confirmCancel" 
                        style="padding: 10px 20px; background: #333; border: none; 
                        border-radius: 4px; color: #fff; cursor: pointer;">
                    Cancel
                </button>
                <button id="confirmOk" 
                        style="padding: 10px 20px; background: #f5c842; border: none; 
                        border-radius: 4px; color: #000; font-weight: bold; cursor: pointer;">
                    Confirm
                </button>
            </div>
        `;
        
        this.create(id, title, content, { closeOnBackdrop: false });
        this.open(id);

        document.getElementById('confirmCancel').addEventListener('click', () => {
            this.close(id);
            if (onCancel) onCancel();
        });

        document.getElementById('confirmOk').addEventListener('click', () => {
            this.close(id);
            if (onConfirm) onConfirm();
        });

        return id;
    }

    // --- PRIVATE METHODS ---

    #removeModal(id) {
        const modal = this.#modals.get(id);
        if (modal) {
            modal.element.remove();
            this.#modals.delete(id);
            this.#activeModals = this.#activeModals.filter(mId => mId !== id);
        }
    }

    #setupFocusTrap(modalElement) {
        const focusable = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        this.#focusableElements = Array.from(focusable)
            .filter(el => !el.disabled && el.offsetParent !== null);
        
        if (this.#focusableElements.length === 0) {
            const box = modalElement.querySelector('.vexor-modal-box');
            if (box) box.setAttribute('tabindex', '-1');
            this.#focusableElements = [box].filter(Boolean);
        }

        this.#firstFocusable = this.#focusableElements[0];
        this.#lastFocusable = this.#focusableElements[this.#focusableElements.length - 1];

        modalElement.addEventListener('keydown', this.#trapFocus.bind(this));
    }

    #trapFocus(e) {
        if (e.key !== 'Tab') return;
        
        const activeElement = document.activeElement;
        const modalElement = this.#modals.get(this.#activeModals[this.#activeModals.length - 1])?.element;
        if (!modalElement || !modalElement.contains(activeElement)) {
            e.preventDefault();
            this.#firstFocusable?.focus();
            return;
        }

        if (e.shiftKey && activeElement === this.#firstFocusable) {
            e.preventDefault();
            this.#lastFocusable?.focus();
        } else if (!e.shiftKey && activeElement === this.#lastFocusable) {
            e.preventDefault();
            this.#firstFocusable?.focus();
        }
    }

    #focusFirstElement(modalElement) {
        const focusable = modalElement.querySelector(
            'input:not([disabled]), textarea:not([disabled]), button:not([disabled])'
        );
        if (focusable) {
            setTimeout(() => focusable.focus(), 100);
        }
    }

    #restoreFocus() {
        const lastFocused = document.activeElement;
        if (lastFocused && lastFocused.closest('.vexor-modal')) {
            document.body.focus();
        }
    }

    #setupEscapeHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const active = this.#activeModals;
                if (active.length > 0) {
                    const lastId = active[active.length - 1];
                    const modal = this.#modals.get(lastId);
                    if (modal && modal.options.closeOnEscape !== false) {
                        this.close(lastId);
                    }
                }
            }
        });
    }
}

// Export single instance
export const modalManager = ModalManager.getInstance();

// For backward compatibility
export const ModalManager = {
    create: (id, title, content, options) => modalManager.create(id, title, content, options),
    open: (id) => modalManager.open(id),
    close: (id) => modalManager.close(id),
    closeAll: () => modalManager.closeAll(),
    isOpen: (id) => modalManager.isOpen(id),
    updateContent: (id, content) => modalManager.updateContent(id, content),
    showAlert: (title, message, type) => modalManager.showAlert(title, message, type),
    showConfirm: (title, message, onConfirm, onCancel) => 
        modalManager.showConfirm(title, message, onConfirm, onCancel)
};
