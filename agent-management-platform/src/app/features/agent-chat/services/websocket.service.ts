// src/app/features/agent-chat/services/websocket.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, Subject, timer, EMPTY } from 'rxjs';
import { retryWhen, tap, delayWhen, takeWhile } from 'rxjs/operators';
import { WebSocketEvent, WebSocketEventType, WebSocketConfig } from '../models/websocket.interface';
import { environment } from '@env/environment';

@Injectable({
providedIn: 'root'
})
export class WebSocketService {
private socket: WebSocket | null = null;
private messageSubject = new Subject<WebSocketEvent<any>>();
private reconnectAttempts = 0;

private readonly config: WebSocketConfig = {
url: environment.websocketUrl,
reconnectInterval: 5000,
reconnectAttempts: 10
};

/**
* Observable stream of WebSocket messages
*/
readonly messages$: Observable<WebSocketEvent<any>> = this.messageSubject.asObservable();

/**
* Connect to WebSocket server
*/
connect(): void {
if (this.socket?.readyState === WebSocket.OPEN) {
console.log('WebSocket already connected');
return;
}

try {
this.socket = new WebSocket(this.config.url);

this.socket.onopen = () => {
console.log('WebSocket connected');
this.reconnectAttempts = 0;
this.messageSubject.next({
type: WebSocketEventType.Connect,
payload: null,
timestamp: new Date()
});
};

this.socket.onmessage = (event) => {
try {
const data = JSON.parse(event.data);
this.messageSubject.next({
type: WebSocketEventType.Message,
payload: data,
timestamp: new Date()
});
} catch (error) {
console.error('Failed to parse WebSocket message:', error);
}
};

this.socket.onerror = (error) => {
console.error('WebSocket error:', error);
this.messageSubject.next({
type: WebSocketEventType.Error,
payload: error,
timestamp: new Date()
});
};

this.socket.onclose = () => {
console.log('WebSocket disconnected');
this.messageSubject.next({
type: WebSocketEventType.Disconnect,
payload: null,
timestamp: new Date()
});
this.handleReconnect();
};
} catch (error) {
console.error('Failed to create WebSocket connection:', error);
}
}

/**
* Send message through WebSocket
*/
send<T>(type: string, payload: T): void {
if (this.socket?.readyState === WebSocket.OPEN) {
this.socket.send(JSON.stringify({ type, payload }));
} else {
console.warn('WebSocket is not connected');
}
}

/**
* Disconnect from WebSocket server
*/
disconnect(): void {
if (this.socket) {
this.socket.close();
this.socket = null;
}
}

/**
* Handle reconnection logic
*/
private handleReconnect(): void {
if (this.reconnectAttempts < this.config.reconnectAttempts) {
this.reconnectAttempts++;
console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

setTimeout(() => {
this.connect();
}, this.config.reconnectInterval);
} else {
console.error('Max reconnection attempts reached');
}
}
}
