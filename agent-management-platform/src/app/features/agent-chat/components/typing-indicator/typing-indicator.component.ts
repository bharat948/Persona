// src/app/features/agent-chat/components/typing-indicator/typing-indicator.component.ts

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
selector: 'app-typing-indicator',
standalone: true,
imports: [CommonModule],
changeDetection: ChangeDetectionStrategy.OnPush,
template: `
    <div class="flex items-center space-x-2">
      <div class="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
      <div class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
      <div class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
      <span class="text-sm text-gray-500">Agent is typing...</span>
    </div>
`,
styles: [`
@keyframes pulse {
0%, 100% {
opacity: 0.4;
}
50% {
opacity: 1;
}
}

.animate-pulse {
animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`]
})
export class TypingIndicatorComponent {}
