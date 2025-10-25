// src/app/features/agent-chat/components/chat-sidebar/chat-sidebar.component.ts

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../models/message.interface';
import { AgentListItemComponent } from '../agent-list-item/agent-list-item.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, AgentListItemComponent, ButtonComponent],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatSidebarComponent {
  @Input() conversations: Conversation[] = [];
  @Input() activeConversation: Conversation | null = null;
  @Output() conversationSelect = new EventEmitter<Conversation>();
  @Output() newAgent = new EventEmitter<void>();
}
