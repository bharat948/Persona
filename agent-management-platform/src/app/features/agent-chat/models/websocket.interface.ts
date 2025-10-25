// src/app/features/agent-chat/models/websocket.interface.ts

export enum WebSocketEventType {
Connect = 'CONNECT',
Disconnect = 'DISCONNECT',
Message = 'MESSAGE',
Typing = 'TYPING',
Error = 'ERROR'
}

export interface WebSocketEvent<T> {
type: WebSocketEventType;
payload: T;
timestamp: Date;
}

export interface WebSocketConfig {
url: string;
reconnectInterval: number;
reconnectAttempts: number;
}
