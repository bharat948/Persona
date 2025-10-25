// src/app/features/agent-registration/components/agent-registration-form/agent-registration-form.component.ts

import { Component, Input, Output, EventEmitter, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgentFormData, RegistrationStep, ThirdPartyIntegration } from '../../models/agent-form.interface';
import { MetadataSectionComponent } from '../metadata-section/metadata-section.component';
import { McpServerSectionComponent } from '../mcp-server-section/mcp-server-section.component';
import { IntegrationSectionComponent } from '../integration-section/integration-section.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
selector: 'app-agent-registration-form',
standalone: true,
imports: [
CommonModule,
ReactiveFormsModule,
MetadataSectionComponent,
McpServerSectionComponent,
IntegrationSectionComponent,
ProgressBarComponent
],
changeDetection: ChangeDetectionStrategy.OnPush,
templateUrl: './agent-registration-form.component.html',
styleUrl: './agent-registration-form.component.scss'
})
export class AgentRegistrationFormComponent {
private readonly fb = inject(FormBuilder);

@Input({ required: true }) integrations: ThirdPartyIntegration[] = [];
@Input() isSubmitting = false;
@Output() formSubmit = new EventEmitter<AgentFormData>();
@Output() formCancel = new EventEmitter<void>();

currentStep = signal(RegistrationStep.AgentDetails);
readonly RegistrationStep = RegistrationStep;

agentForm = this.fb.group({
name: ['', [Validators.required, Validators.minLength(3)]],
version: ['', [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
description: ['', [Validators.required, Validators.minLength(10)]],
author: ['', [Validators.required]]
});

get progressPercent(): number {
return (this.currentStep() / 3) * 100;
}

get isFormValid(): boolean {
return this.agentForm.valid;
}

onSubmit(): void {
if (this.agentForm.valid) {
const formData: AgentFormData = {
metadata: this.agentForm.value as any,
mcpServers: [],
integrations: this.integrations.filter(i => i.enabled)
};
this.formSubmit.emit(formData);
}
}

onCancel(): void {
this.formCancel.emit();
}
}
