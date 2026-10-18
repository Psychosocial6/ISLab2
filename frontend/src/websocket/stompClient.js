import {Client} from '@stomp/stompjs';

let stompClient = null;

export function connectWebSocket(onEventReceived) {
    stompClient = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        reconnectDelay: 5000,
        onConnect: () => {
            stompClient.subscribe('/topic/persons', (message) => {
                if (message.body) {
                    const event = JSON.parse(message.body);
                    onEventReceived(event);
                }
            });
        },
        onStompError: (frame) => {
            console.error(frame.headers['message']);
        }
    });

    stompClient.activate();
}

export function disconnectWebSocket() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
}