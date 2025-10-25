// src/app/features/mcp-server-catalog/components/server-list/server-list.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { McpServerService } from '../../services/mcp-server.service';
import { ServerCardComponent } from '../server-card/server-card.component';
import { SearchBarComponent } from 'src/app/shared/components/search-bar/search-bar.component';
import { FilterBarComponent } from 'src/app/shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { ServerFilters } from '../../models/mcp-server.interface';

@Component({
  selector: 'app-server-list',
  standalone: true,
  imports: [CommonModule, ServerCardComponent, SearchBarComponent, FilterBarComponent, PaginationComponent],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss'
})
export class ServerListComponent {
  private readonly serverService = inject(McpServerService);

  servers = toSignal(this.serverService.servers$, { initialValue: { servers: [], pagination: { page: 1, pageSize: 6, totalItems: 0, totalPages: 1 } } });

  onAddServer(serverId: string): void {
    this.serverService.addServer(serverId).subscribe();
  }

  onFilterChange(filters: ServerFilters): void {
    this.serverService.updateFilters(filters);
  }

  onPageChange(page: number): void {
    this.serverService.updatePage(page);
  }
}
