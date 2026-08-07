const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        // Remove trailing slash if present
        return import.meta.env.VITE_API_URL.replace(/\/$/, '');
    }
    return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = `${API_BASE_URL}/ws`;

// Native WebSocket URL (no SockJS) — avoids 'unload' Permissions Policy violation
const getWsNativeUrl = () => {
    if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
        const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
        return `${wsProtocol}${API_BASE_URL.slice(API_BASE_URL.indexOf('://'))}/ws-native`;
    }
    // Handle relative paths (e.g., in a production Docker deployment where frontend & backend share a domain/port)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const base = API_BASE_URL === '/' ? '' : API_BASE_URL;
    return `${wsProtocol}://${host}${base}/ws-native`;
};

export const WS_NATIVE_URL = getWsNativeUrl();
