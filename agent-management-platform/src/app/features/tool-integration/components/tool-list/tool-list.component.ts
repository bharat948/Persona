// src/app/features/tool-integration/components/tool-list/tool-list.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolIntegrationService } from '../../services/tool-integration.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { SearchBarComponent } from 'src/app/shared/components/search-bar/search-bar.component';
import { CategoryFilterComponent } from 'src/app/shared/components/category-filter/category-filter.component';
import { ConfigModalComponent } from '../config-modal/config-modal.component';
import { Tool, ToolConfiguration } from '../../models/tool.interface';

@Component({
  selector: 'app-tool-list',
  standalone: true,
  imports: [CommonModule, ToolCardComponent, SearchBarComponent, CategoryFilterComponent, ConfigModalComponent],
  templateUrl: './tool-list.component.html',
  styleUrl: './tool-list.component.scss'
})
export class ToolListComponent {
  private readonly toolService = inject(ToolIntegrationService);

  tools = toSignal(this.toolService.tools$, { initialValue: [] });
  selectedTool = signal<Tool | undefined>(undefined);
  isModalOpen = signal(false);

  onConnect(toolId: string): void {
    // For simplicity, we'll just open the config modal on connect
    this.toolService.getToolById(toolId).subscribe(tool => {
      this.selectedTool.set(tool);
      this.isModalOpen.set(true);
    });
  }

  onConfigure(toolId: string): void {
    this.toolService.getToolById(toolId).subscribe(tool => {
      this.selectedTool.set(tool);
      this.isModalOpen.set(true);
    });
  }

  onSaveConfiguration(config: ToolConfiguration): void {
    if (this.selectedTool()) {
      this.toolService.configureTool(this.selectedTool()!.id, config).subscribe(() => {
        this.isModalOpen.set(false);
      });
    }
  }
}
