import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg">
        <h2 class="text-lg font-bold mb-4">{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="flex justify-end mt-4">
          <button (click)="cancel.emit()" class="btn btn-secondary mr-2">Cancel</button>
          <button (click)="confirm.emit()" class="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
