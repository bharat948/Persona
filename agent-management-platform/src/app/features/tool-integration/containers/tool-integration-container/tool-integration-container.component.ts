// src/app/features/tool-integration/containers/tool-integration-container/tool-integration-container.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolListComponent } from '../../components/tool-list/tool-list.component';
import { SidebarComponent } from 'src/app/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-tool-integration-container',
  standalone: true,
  imports: [CommonModule, ToolListComponent, SidebarComponent],
  template: `
    <div class="flex">
      <app-sidebar></app-sidebar>
      <div class="flex-1 p-4">
        <h1 class="text-2xl font-bold mb-4">Tool Integration</h1>
        <app-tool-list></app-tool-list>
      </div>
    </div>
  `
})
export class ToolIntegrationContainerComponent {}
