import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>Category Filter</div>
  `
})
export class CategoryFilterComponent {
  @Output() categoryChange = new EventEmitter<string>();
}
