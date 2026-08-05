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
const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
export const WS_NATIVE_URL = `${wsProtocol}${API_BASE_URL.slice(API_BASE_URL.indexOf('://'))}` + '/ws-native';
