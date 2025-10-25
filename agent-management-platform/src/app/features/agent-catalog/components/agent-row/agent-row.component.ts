// src/app/features/agent-catalog/components/agent-row/agent-row.component.ts

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Agent } from '../../models/agent.interface';
import { AgentIconComponent } from 'src/app/shared/components/agent-icon/agent-icon.component';
import { CategoryBadgeComponent } from 'src/app/shared/components/category-badge/category-badge.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-agent-row',
  standalone: true,
  imports: [CommonModule, AgentIconComponent, CategoryBadgeComponent, ButtonComponent],
  templateUrl: './agent-row.component.html',
  styleUrl: './agent-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentRowComponent {
  @Input({ required: true }) agent!: Agent;
  @Output() view = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onView(): void {
    this.view.emit(this.agent.id);
  }

  onDelete(): void {
    this.delete.emit(this.agent.id);
  }
}
