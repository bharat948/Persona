// src/app/features/tool-integration/components/config-modal/config-modal.component.ts

import { Component, Input, Output, EventEmitter, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tool, ToolConfiguration, ToolPermission } from '../../models/tool.interface';

@Component({
selector: 'app-config-modal',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
changeDetection: ChangeDetectionStrategy.OnPush,
templateUrl: './config-modal.component.html',
styleUrl: './config-modal.component.scss'
})
export class ConfigModalComponent implements OnInit {
private readonly fb = inject(FormBuilder);

@Input({ required: true }) tool!: Tool;
@Input() isOpen = false;
@Output() closeModal = new EventEmitter<void>();
@Output() saveConfiguration = new EventEmitter<ToolConfiguration>();

configForm!: FormGroup;
permissions: ToolPermission[] = [];

ngOnInit(): void {
this.initializeForm();
this.loadPermissions();
}

private initializeForm(): void {
this.configForm = this.fb.group({
apiKey: [
this.tool.configuration?.apiKey || '',
[Validators.required, Validators.minLength(20)]
],
apiToken: [
this.tool.configuration?.apiToken || '',
[Validators.required, Validators.minLength(20)]
]
});
}

private loadPermissions(): void {
// Load permissions from tool configuration or defaults
this.permissions = this.tool.configuration?.permissions || [
{ id: '1', name: 'Read access to boards', description: '', enabled: true, required: true },
{ id: '2', name: 'Write access to cards', description: '', enabled: true, required: true },
{ id: '3', name: 'Create new boards', description: '', enabled: false, required: false }
];
}

onPermissionChange(permission: ToolPermission, enabled: boolean): void {
permission.enabled = enabled;
}

onSubmit(): void {
if (this.configForm.valid) {
const configuration: ToolConfiguration = {
apiKey: this.configForm.value.apiKey,
apiToken: this.configForm.value.apiToken,
permissions: this.permissions
};

this.saveConfiguration.emit(configuration);
}
}

onCancel(): void {
this.closeModal.emit();
}

get isFormValid(): boolean {
return this.configForm.valid;
}
}
