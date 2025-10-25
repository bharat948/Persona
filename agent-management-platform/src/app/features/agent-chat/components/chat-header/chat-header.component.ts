// src/app/features/agent-chat/components/chat-header/chat-header.component.ts

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../models/message.interface';
import { StatusIndicatorComponent } from 'src/app/shared/components/status-indicator/status-indicator.component';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, StatusIndicatorComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHeaderComponent {
  @Input({ required: true }) conversation!: Conversation;
}
