import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { WS_BASE_URL } from '../api/config';

export const useCricketSocket = (matchId, onStateUpdate) => {
    const stompClient = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!matchId) return;

        const socket = new SockJS(WS_BASE_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log('[CricketWS] ' + str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            setConnected(true);
            
            client.subscribe(`/topic/cricket/${matchId}`, (message) => {
                const stateDto = JSON.parse(message.body);
                if (onStateUpdate) {
                    onStateUpdate(stateDto);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Cricket Stomp error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [matchId, onStateUpdate]);

    return { connected };
};
