// src/app/features/agent-catalog/containers/agent-catalog-container/agent-catalog-container.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentTableComponent } from '../../components/agent-table/agent-table.component';
import { HeaderComponent } from 'src/app/layout/header/header.component';

@Component({
  selector: 'app-agent-catalog-container',
  standalone: true,
  imports: [CommonModule, AgentTableComponent, HeaderComponent],
  template: `
    <div>
      <app-header></app-header>
      <main class="p-4">
        <h1 class="text-2xl font-bold mb-4">Agent Catalog</h1>
        <app-agent-table></app-agent-table>
      </main>
    </div>
  `
})
export class AgentCatalogContainerComponent {}
