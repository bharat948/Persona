// src/app/features/agent-chat/components/chat-message/chat-message.component.ts

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, MessageSender } from '../../models/message.interface';
import { AvatarComponent } from 'src/app/shared/components/avatar/avatar.component';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: Message;

  readonly MessageSender = MessageSender;

  get isUserMessage(): boolean {
    return this.message.sender === MessageSender.User;
  }

  get senderLabel(): string {
    return this.isUserMessage ? 'You' : this.message.senderName;
  }

  get messageClass(): string {
    return this.isUserMessage
      ? 'bg-user-message text-text-dark-chat'
      : 'bg-agent-message text-text-dark-chat';
  }

  get alignmentClass(): string {
    return this.isUserMessage ? 'justify-end' : 'justify-start';
  }
}
