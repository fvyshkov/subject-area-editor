// API configuration
// In development: uses localhost:8001
// In production: uses relative path (proxied by nginx)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
