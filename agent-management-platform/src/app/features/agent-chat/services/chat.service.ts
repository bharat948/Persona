// src/app/features/agent-chat/services/chat.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, switchMap, filter } from 'rxjs';
import { Conversation, Message, SendMessageRequest, CreateConversationRequest, TypingIndicator } from '../models/message.interface';
import { WebSocketService } from './websocket.service';
import { WebSocketEventType } from '../models/websocket.interface';
import { environment } from '@env/environment';

@Injectable({
providedIn: 'root'
})
export class ChatService {
private readonly http = inject(HttpClient);
private readonly wsService = inject(WebSocketService);
private readonly apiUrl = `${environment.apiUrl}/chat`;

// State management
private activeConversationSubject = new BehaviorSubject<Conversation | null>(null);
private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
private typingIndicatorSubject = new BehaviorSubject<TypingIndicator | null>(null);

readonly activeConversation$ = this.activeConversationSubject.asObservable();
readonly conversations$ = this.conversationsSubject.asObservable();
readonly typingIndicator$ = this.typingIndicatorSubject.asObservable();

constructor() {
this.initializeWebSocket();
}

/**
* Initialize WebSocket connection and handlers
*/
private initializeWebSocket(): void {
this.wsService.connect();

// Handle incoming messages
this.wsService.messages$.pipe(
filter(event => event.type === WebSocketEventType.Message)
).subscribe(event => {
const message = event.payload as Message;
this.addMessageToConversation(message);
});

// Handle typing indicators
this.wsService.messages$.pipe(
filter(event => event.type === WebSocketEventType.Message),
map(event => event.payload as { type: string; data: TypingIndicator }),
filter(payload => payload.type === 'typing')
).subscribe(payload => {
this.typingIndicatorSubject.next(payload.data);
});
}

/**
* Get all conversations
*/
getConversations(): Observable<Conversation[]> {
return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`).pipe(
tap(conversations => this.conversationsSubject.next(conversations))
);
}

/**
* Get conversation by ID
*/
getConversation(conversationId: string): Observable<Conversation> {
return this.http.get<Conversation>(`${this.apiUrl}/conversations/${conversationId}`);
}

/**
* Create new conversation
*/
createConversation(request: CreateConversationRequest): Observable<Conversation> {
return this.http.post<Conversation>(`${this.apiUrl}/conversations`, request).pipe(
tap(conversation => {
const conversations = this.conversationsSubject.value;
this.conversationsSubject.next([conversation, ...conversations]);
this.setActiveConversation(conversation);
})
);
}

/**
* Send message
*/
sendMessage(request: SendMessageRequest): Observable<Message> {
return this.http.post<Message>(`${this.apiUrl}/messages`, request).pipe(
tap(message => this.addMessageToConversation(message))
);
}

/**
* Set active conversation
*/
setActiveConversation(conversation: Conversation | null): void {
this.activeConversationSubject.next(conversation);

if (conversation) {
// Join WebSocket room for this conversation
this.wsService.send('join', { conversationId: conversation.id });
}
}

/**
* Add message to conversation
*/
private addMessageToConversation(message: Message): void {
const conversations = this.conversationsSubject.value;
const updatedConversations = conversations.map(conv => {
if (conv.id === message.conversationId) {
return {
...conv,
messages: [...conv.messages, message],
lastMessage: message,
lastMessageAt: message.timestamp
};
}
return conv;
});

this.conversationsSubject.next(updatedConversations);

// Update active conversation if it matches
const activeConv = this.activeConversationSubject.value;
if (activeConv && activeConv.id === message.conversationId) {
this.activeConversationSubject.next({
...activeConv,
messages: [...activeConv.messages, message],
lastMessage: message,
lastMessageAt: message.timestamp
});
}
}

/**
* Mark messages as read
*/
markAsRead(conversationId: string): Observable<any> {
return this.http.put(`${this.apiUrl}/conversations/${conversationId}/read`, {});
}

/**
* Delete conversation
*/
deleteConversation(conversationId: string): Observable<any> {
return this.http.delete(`${this.apiUrl}/conversations/${conversationId}`).pipe(
tap(() => {
const conversations = this.conversationsSubject.value.filter(c => c.id !== conversationId);
this.conversationsSubject.next(conversations);

if (this.activeConversationSubject.value?.id === conversationId) {
this.activeConversationSubject.next(null);
}
})
);
}

/**
* Send typing indicator
*/
sendTypingIndicator(conversationId: string, isTyping: boolean): void {
this.wsService.send('typing', { conversationId, isTyping });
}

/**
* Cleanup on service destruction
*/
ngOnDestroy(): void {
this.wsService.disconnect();
}
}
