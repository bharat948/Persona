// src/app/features/agent-chat/models/message.interface.ts

export enum MessageType {
Text = 'TEXT',
Image = 'IMAGE',
File = 'FILE',
System = 'SYSTEM'
}

export enum MessageSender {
User = 'USER',
Agent = 'AGENT',
System = 'SYSTEM'
}

export interface Message {
id: string;
conversationId: string;
sender: MessageSender;
senderName: string;
senderAvatarUrl?: string;
type: MessageType;
content: string;
metadata?: {
fileName?: string;
fileSize?: number;
fileUrl?: string;
imageUrl?: string;
};
timestamp: Date;
isRead: boolean;
}

export interface Conversation {
id: string;
agentId: string;
agentName: string;
agentAvatarUrl?: string;
userId: string;
messages: Message[];
lastMessage?: Message;
lastMessageAt: Date;
createdAt: Date;
isActive: boolean;
}

export interface TypingIndicator {
conversationId: string;
agentId: string;
isTyping: boolean;
}

export interface SendMessageRequest {
conversationId: string;
content: string;
type: MessageType;
}

export interface CreateConversationRequest {
agentId: string;
initialMessage?: string;
}
