function Config() {
    const name = 'vexorion-config';

    const defaults = {
        language: navigator.language?.split('-')[0] || 'en',
        autosave: true,
        theme: 'dark',
        rememberMe: false
    };

    let storage = { ...defaults };

    // Load from localStorage
    try {
        const saved = localStorage.getItem(name);
        if (saved) {
            const data = JSON.parse(saved);
            storage = { ...storage, ...data };
        } else {
            localStorage.setItem(name, JSON.stringify(storage));
        }
    } catch (error) {
        console.error('[Config] Load error:', error);
    }

    function getKey(key) {
        return storage[key];
    }

    function setKey(...args) {
        for (let i = 0; i < args.length; i += 2) {
            storage[args[i]] = args[i + 1];
        }
        try {
            localStorage.setItem(name, JSON.stringify(storage));
        } catch (error) {
            console.error('[Config] Save error:', error);
        }
    }

    function getAll() {
        return { ...storage };
    }

    function clear() {
        storage = { ...defaults };
        try {
            localStorage.removeItem(name);
        } catch (error) {
            console.error('[Config] Clear error:', error);
        }
    }

    return {
        getKey,
        setKey,
        getAll,
        clear
    };
}

const config = Config();
export { config };
export const Config = config;
