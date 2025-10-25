import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../models/message.interface';

@Component({
  selector: 'app-agent-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" (click)="select.emit(conversation)">
      <p class="font-semibold">{{ conversation.agentName }}</p>
      <p class="text-sm text-gray-500 truncate">{{ conversation.lastMessage?.content }}</p>
    </div>
  `
})
export class AgentListItemComponent {
  @Input({ required: true }) conversation!: Conversation;
  @Output() select = new EventEmitter<Conversation>();
}
