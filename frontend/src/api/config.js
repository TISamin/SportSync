const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        // Remove trailing slash if present
        return import.meta.env.VITE_API_URL.replace(/\/$/, '');
    }
    return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = `${API_BASE_URL}/ws`;
