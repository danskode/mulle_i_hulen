import { persistentStore } from '../lib/persistentStore.js';

// Create persistent auth store
const authStore = persistentStore('auth', null);

// Helper functions to use in components and pages
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