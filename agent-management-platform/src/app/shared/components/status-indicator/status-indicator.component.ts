import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="w-3 h-3 rounded-full" [ngClass]="statusClass"></span>
  `
})
export class StatusIndicatorComponent {
  @Input() status: 'online' | 'offline' = 'offline';

  get statusClass(): string {
    return this.status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  }
}
