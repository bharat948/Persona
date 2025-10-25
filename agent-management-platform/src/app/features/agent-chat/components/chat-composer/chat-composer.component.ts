// src/app/features/agent-chat/components/chat-composer/chat-composer.component.ts

import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { InputFieldComponent } from 'src/app/shared/components/input-field/input-field.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-chat-composer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, ButtonComponent],
  templateUrl: './chat-composer.component.html',
  styleUrl: './chat-composer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComposerComponent {
  @Output() messageSend = new EventEmitter<string>();

  messageControl = new FormControl('', [Validators.required]);

  sendMessage(): void {
    if (this.messageControl.valid) {
      this.messageSend.emit(this.messageControl.value!);
      this.messageControl.reset();
    }
  }
}
