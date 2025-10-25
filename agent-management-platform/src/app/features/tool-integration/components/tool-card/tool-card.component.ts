// src/app/features/tool-integration/components/tool-card/tool-card.component.ts

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tool, ToolStatus } from '../../models/tool.interface';
import { ToolIconComponent } from 'src/app/shared/components/tool-icon/tool-icon.component';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [CommonModule, ToolIconComponent],
  templateUrl: './tool-card.component.html',
  styleUrl: './tool-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolCardComponent {
  @Input({ required: true }) tool!: Tool;
  @Output() connect = new EventEmitter<string>();
  @Output() configure = new EventEmitter<string>();

  readonly ToolStatus = ToolStatus;

  onConnect(): void {
    this.connect.emit(this.tool.id);
  }

  onConfigure(): void {
    this.configure.emit(this.tool.id);
  }
}
