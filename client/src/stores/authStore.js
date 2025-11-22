import { writable } from 'svelte/store';

// Tjek om vi er i browseren
const isBrowser = typeof window !== 'undefined';

// Hent evt. gemt auth data fra localStorage
const storedAuth = isBrowser ? localStorage.getItem('auth') : null;
const initialAuth = storedAuth ? JSON.parse(storedAuth) : null;

// Opret store med initial værdi
const authStore = writable(initialAuth);

// Subscribe til ændringer og gem i localStorage
if (isBrowser) {
    authStore.subscribe(value => {
        if (value) {
            localStorage.setItem('auth', JSON.stringify(value));
        } else {
            localStorage.removeItem('auth');
        }
    });
}

// Helper funktioner
export const auth = {
    subscribe: authStore.subscribe,

    login: (userData) => {
        authStore.set(userData);
    },

    logout: () => {
        authStore.set(null);
    },

    getToken: () => {
        let token = null;
        const unsubscribe = authStore.subscribe(value => {
            if (value) token = value.token;
        });
        unsubscribe();
        return token;
    }
};
