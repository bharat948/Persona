import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-10 h-10 rounded-full bg-cover bg-center" [style.backgroundImage]="'url(' + avatarUrl + ')'"></div>
  `
})
export class AvatarComponent {
  @Input() avatarUrl = '';
}
