import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  header: string;
  key: string;
  width?: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 border-b-2 border-gray-300">
            <th *ngFor="let column of columns" 
                class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                [style.width]="column.width">
              <div class="flex items-center gap-2">
                <span>{{ column.header }}</span>
                <svg *ngIf="column.sortable" class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; let isLast = last" 
              class="border-b border-gray-200 hover:bg-gray-50 transition"
              [class.border-b-0]="isLast">
            <td *ngFor="let column of columns" class="px-6 py-4 text-sm text-gray-900">
              {{ row[column.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
}
