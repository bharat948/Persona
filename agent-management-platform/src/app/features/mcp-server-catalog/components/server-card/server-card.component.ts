// src/app/features/mcp-server-catalog/components/server-card/server-card.component.ts

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { McpServer, ServerStatus } from '../../models/mcp-server.interface';

@Component({
  selector: 'app-server-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-card.component.html',
  styleUrl: './server-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerCardComponent {
  @Input({ required: true }) server!: McpServer;
  @Output() addServer = new EventEmitter<string>();

  readonly ServerStatus = ServerStatus;

  onAddServer(): void {
    this.addServer.emit(this.server.id);
  }
}
