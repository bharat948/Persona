import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tool-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img [src]="logoUrl" [alt]="name" class="w-8 h-8">
  `
})
export class ToolIconComponent {
  @Input() logoUrl = '';
  @Input() name = '';
}
