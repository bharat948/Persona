// src/app/features/agent-chat/components/chat-main/chat-main.component.ts

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../models/message.interface';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { ChatHistoryComponent } from '../chat-history/chat-history.component';
import { ChatComposerComponent } from '../chat-composer/chat-composer.component';

@Component({
  selector: 'app-chat-main',
  standalone: true,
  imports: [CommonModule, ChatHeaderComponent, ChatHistoryComponent, ChatComposerComponent],
  templateUrl: './chat-main.component.html',
  styleUrl: './chat-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMainComponent {
  @Input({ required: true }) conversation!: Conversation;
  @Input() isTyping = false;
  @Output() messageSend = new EventEmitter<string>();
}
