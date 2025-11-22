import { writable } from 'svelte/store';

// Browser check - we don't want SSR to try to access localStorage
const isBrowser = typeof window !== 'undefined';

export function persistentStore(key, initialValue) {
    // Get data from localStorage if it exists
    const storedValue = isBrowser ? localStorage.getItem(key) : null;
    const initial = storedValue ? JSON.parse(storedValue) : initialValue;

    // Create the store
    const store = writable(initial);

    // Subscribe to changes and sync to localStorage
    if (isBrowser) {
        store.subscribe(value => {
            if (value === null || value === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        });
    }

    return store;
}
