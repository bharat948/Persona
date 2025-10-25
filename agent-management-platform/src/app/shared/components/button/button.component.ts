import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="onClick.emit()" [disabled]="disabled" [ngClass]="getButtonClass()">
      {{ label }}
    </button>
  `
})
export class ButtonComponent {
  @Input() label = 'Button';
  @Input() disabled = false;
  @Input() type: 'primary' | 'secondary' = 'primary';
  @Output() onClick = new EventEmitter<void>();

  getButtonClass(): string {
    const baseClass = 'py-2 px-4 rounded-md font-semibold';
    if (this.type === 'primary') {
      return `${baseClass} bg-primary-agent-catalog text-white`;
    }
    return `${baseClass} bg-gray-200 text-gray-800`;
  }
}
