// src/app/features/agent-chat/store/chat.state.ts

import { Conversation, Message } from '../models/message.interface';

export interface ChatState {
conversations: Conversation[];
activeConversation: Conversation | null;
loading: boolean;
error: string | null;
}

export const initialChatState: ChatState = {
conversations: [],
activeConversation: null,
loading: false,
error: null
};
