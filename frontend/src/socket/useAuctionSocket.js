import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuctionStore } from '../store/auctionStore';
import { WS_BASE_URL } from '../api/config';

export const useAuctionSocket = (roomCode) => {
    const stompClient = useRef(null);
    const updateState = useAuctionStore(state => state.updateState);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!roomCode) return;

        const socket = new SockJS(WS_BASE_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            setConnected(true);
            
            // Subscribe to live state updates
            client.subscribe(`/topic/auction/${roomCode}`, (message) => {
                const stateDto = JSON.parse(message.body);
                updateState(stateDto);
            });

            // Subscribe to end event
            client.subscribe(`/topic/auction/${roomCode}/ended`, (message) => {
                if (message.body === 'ENDED') {
                    updateState({ isFinished: true, statusMessage: 'Auction Completely Finished!' });
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [roomCode, updateState]);

    const startAuction = () => {
        if (stompClient.current && connected) {
            stompClient.current.publish({
                destination: `/app/auction/start`,
                body: JSON.stringify({ roomCode })
            });
        }
    };

    const nextPlayer = () => {
        if (stompClient.current && connected) {
            stompClient.current.publish({
                destination: `/app/auction/next`,
                body: JSON.stringify({ roomCode })
            });
        }
    };

    const placeBid = (teamId, amount) => {
        if (stompClient.current && connected) {
            stompClient.current.publish({
                destination: `/app/auction/bid`,
                body: JSON.stringify({ roomCode, teamId, amount })
            });
        }
    };

    return { connected, startAuction, nextPlayer, placeBid };
};
