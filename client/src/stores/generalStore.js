import { readable } from "svelte/store";

const PORT = 8081;

export const BASE_URL = readable("http://localhost:8081");