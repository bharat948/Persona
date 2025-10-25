// src/app/features/agent-catalog/components/agent-table/agent-table.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs/interop';
import { AgentCatalogService } from '../../services/agent-catalog.service';
import { AgentRowComponent } from '../agent-row/agent-row.component';
import { TableHeaderComponent } from '../table-header/table-header.component';
import { SearchBarComponent } from 'src/app/shared/components/search-bar/search-bar.component';
import { FilterBarComponent } from 'src/app/shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { AgentFilters, AgentSorting } from '../../models/agent.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agent-table',
  standalone: true,
  imports: [CommonModule, AgentRowComponent, TableHeaderComponent, SearchBarComponent, FilterBarComponent, PaginationComponent],
  templateUrl: './agent-table.component.html',
  styleUrl: './agent-table.component.scss'
})
export class AgentTableComponent {
  private readonly agentService = inject(AgentCatalogService);
  private readonly router = inject(Router);

  agents = toSignal(this.agentService.agents$, { initialValue: { agents: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 } } });

  onView(agentId: string): void {
    this.router.navigate(['/agents', agentId]);
  }

  onDelete(agentId: string): void {
    this.agentService.deleteAgent(agentId).subscribe();
  }

  onFilterChange(filters: AgentFilters): void {
    this.agentService.updateFilters(filters);
  }

  onSort(sorting: AgentSorting): void {
    this.agentService.updateSorting(sorting);
  }

  onPageChange(page: number): void {
    this.agentService.updatePage(page);
  }
}
