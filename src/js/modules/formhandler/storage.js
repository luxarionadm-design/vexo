/**
 * Storage utilities
 */
const STORAGE_KEYS = {
    REMEMBER: 'vexor_remember',
};

export function saveRememberState(checked) {
    try {
        localStorage.setItem(STORAGE_KEYS.REMEMBER, JSON.stringify(checked));
    } catch (error) {
        console.error('[Storage] Save remember error:', error);
    }
}

export function loadRememberState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.REMEMBER);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('[Storage] Load remember error:', error);
    }
    return false;
}
