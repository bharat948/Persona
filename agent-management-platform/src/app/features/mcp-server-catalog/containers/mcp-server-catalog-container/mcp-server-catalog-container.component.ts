// src/app/features/mcp-server-catalog/containers/mcp-server-catalog-container/mcp-server-catalog-container.component.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerListComponent } from '../../components/server-list/server-list.component';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-mcp-server-catalog-container',
  standalone: true,
  imports: [CommonModule, ServerListComponent, ConfirmationModalComponent],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">MCP Server Catalog</h1>
      <app-server-list></app-server-list>
      <app-confirmation-modal
        [isOpen]="isModalOpen()"
        (confirm)="onConfirm()"
        (cancel)="onCancel()"
      ></app-confirmation-modal>
    </div>
  `
})
export class McpServerCatalogContainerComponent {
  isModalOpen = signal(false);

  onConfirm(): void {
    // Handle confirmation logic
    this.isModalOpen.set(false);
  }

  onCancel(): void {
    this.isModalOpen.set(false);
  }
}
