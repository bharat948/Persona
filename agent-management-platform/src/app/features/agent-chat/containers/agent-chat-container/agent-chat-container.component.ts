// src/app/features/agent-chat/containers/agent-chat-container/agent-chat-container.component.ts

import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatMainComponent } from '../../components/chat-main/chat-main.component';
import { ChatService } from '../../services/chat.service';
import { Conversation, SendMessageRequest, MessageType } from '../../models/message.interface';

@Component({
selector: 'app-agent-chat-container',
standalone: true,
imports: [CommonModule, ChatSidebarComponent, ChatMainComponent],
changeDetection: ChangeDetectionStrategy.OnPush,
template: `
    <div class="flex h-screen">
      <app-chat-sidebar
        class="w-1/4"
        [conversations]="conversations()"
        [activeConversation]="activeConversation()"
        (conversationSelect)="onConversationSelect($event)"
        (newAgent)="onNewAgent()"
      ></app-chat-sidebar>
      <div class="flex-1">
        <app-chat-main
          *ngIf="activeConversation()"
          [conversation]="activeConversation()!"
          [isTyping]="isAgentTyping()"
          (messageSend)="onMessageSend($event)"
        ></app-chat-main>
        <div *ngIf="!activeConversation()" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-xl font-semibold">Select a conversation to start chatting</h2>
            <button (click)="onNewAgent()" class="mt-4 px-6 py-3 bg-primary-chat text-white rounded-lg font-semibold hover:bg-primary-chat/90">
              Start New Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AgentChatContainerComponent implements OnInit {
private readonly chatService = inject(ChatService);

// Signals from observables
conversations = toSignal(this.chatService.conversations$, { initialValue: [] });
activeConversation = toSignal(this.chatService.activeConversation$, { initialValue: null });
typingIndicator = toSignal(this.chatService.typingIndicator$, { initialValue: null });

// Computed signal for typing state
isAgentTyping = computed(() => {
const indicator = this.typingIndicator();
const active = this.activeConversation();
return indicator?.conversationId === active?.id && indicator.isTyping;
});

ngOnInit(): void {
this.chatService.getConversations().subscribe();
}

onConversationSelect(conversation: Conversation): void {
this.chatService.setActiveConversation(conversation);
this.chatService.markAsRead(conversation.id).subscribe();
}

onMessageSend(content: string): void {
const conversation = this.activeConversation();
if (!conversation) return;

const request: SendMessageRequest = {
conversationId: conversation.id,
content,
type: MessageType.Text
};

this.chatService.sendMessage(request).subscribe();
}

onNewAgent(): void {
// Navigate to agent selection or show modal
console.log('Create new conversation');
}
}
