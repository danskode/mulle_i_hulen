import { readable } from "svelte/store";

// Use environment variable if available, otherwise fallback to localhost
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";

export const BASE_URL = readable(apiUrl);