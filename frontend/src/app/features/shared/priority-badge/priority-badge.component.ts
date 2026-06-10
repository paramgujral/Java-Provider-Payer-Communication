import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Priority } from '../../../core/models/models';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="priority" [ngClass]="'priority-' + priority.toLowerCase()">
      {{ priority }}
    </span>
  `
})
export class PriorityBadgeComponent {
  @Input() priority!: Priority;
}