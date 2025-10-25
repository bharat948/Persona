// src/app/features/agent-chat/components/chat-history/chat-history.component.ts

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.interface';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { TypingIndicatorComponent } from '../typing-indicator/typing-indicator.component';

@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent, TypingIndicatorComponent],
  templateUrl: './chat-history.component.html',
  styleUrl: './chat-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHistoryComponent {
  @Input() messages: Message[] = [];
  @Input() isTyping = false;
}
