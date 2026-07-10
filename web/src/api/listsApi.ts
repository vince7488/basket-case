// Vite exposes client-safe variables with the VITE_ prefix; this keeps backend URLs out of components.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
