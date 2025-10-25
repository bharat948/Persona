import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agent-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="material-symbols-outlined">{{ icon }}</span>
  `
})
export class AgentIconComponent {
  @Input() icon = '';
}
