import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentCategory } from 'src/app/features/agent-catalog/models/agent.interface';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="px-2 py-1 text-xs font-semibold rounded-full" [ngClass]="getCategoryClass(category)">
      {{ category }}
    </span>
  `
})
export class CategoryBadgeComponent {
  @Input() category!: AgentCategory;

  getCategoryClass(category: AgentCategory): string {
    switch (category) {
      case AgentCategory.Sales:
        return 'bg-blue-200 text-blue-800';
      case AgentCategory.Support:
        return 'bg-green-200 text-green-800';
      case AgentCategory.Marketing:
        return 'bg-yellow-200 text-yellow-800';
      case AgentCategory.DataAnalysis:
        return 'bg-indigo-200 text-indigo-800';
      case AgentCategory.Development:
        return 'bg-pink-200 text-pink-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }
}
