// src/app/features/agent-registration/containers/agent-registration-container/agent-registration-container.component.ts

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgentRegistrationFormComponent } from '../../components/agent-registration-form/agent-registration-form.component';
import { AgentRegistrationService } from '../../services/agent-registration.service';
import { AgentFormData, ThirdPartyIntegration } from '../../models/agent-form.interface';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
selector: 'app-agent-registration-container',
standalone: true,
imports: [CommonModule, AgentRegistrationFormComponent],
template: `
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Register New Agent</h1>
    <app-agent-registration-form
      [integrations]="availableIntegrations()"
      [isSubmitting]="isSubmitting()"
      (formSubmit)="onSubmit($event)"
      (formCancel)="onCancel()"
    ></app-agent-registration-form>
  </div>
`
})
export class AgentRegistrationContainerComponent {
private readonly registrationService = inject(AgentRegistrationService);
private readonly router = inject(Router);

// Signals for reactive state
isSubmitting = signal(false);
availableIntegrations = toSignal(
this.registrationService.getAvailableIntegrations(),
{ initialValue: [] as ThirdPartyIntegration[] }
);

onSubmit(formData: AgentFormData): void {
this.isSubmitting.set(true);

this.registrationService.registerAgent(formData).subscribe({
next: (agent) => {
console.log('Registration successful:', agent);
this.router.navigate(['/agents']);
},
error: (error) => {
console.error('Registration error:', error);
this.isSubmitting.set(false);
},
complete: () => {
this.isSubmitting.set(false);
}
});
}

onCancel(): void {
this.router.navigate(['/agents']);
}
}
