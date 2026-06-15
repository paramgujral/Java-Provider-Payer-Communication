import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Modal {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  actions?: { label: string; callback: () => void }[];
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <!-- Header -->
        <div class="flex items-center gap-3 p-6 border-b border-gray-200" [ngClass]="getHeaderClass()">
          <div [ngSwitch]="data.type" class="shrink-0">
            <svg *ngSwitchCase="'success'" class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <svg *ngSwitchCase="'error'" class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <svg *ngSwitchCase="'warning'" class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <svg *ngSwitchCase="'info'" class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
        </div>

        <!-- Body -->
        <div class="p-6">
          <p class="text-gray-700">{{ data.message }}</p>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 p-6 border-t border-gray-200 justify-end">
          <button (click)="close()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium">
            Cancel
          </button>
          <button *ngFor="let action of data.actions" (click)="executeAction(action)" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() data: Modal = { title: '', message: '', type: 'info' };
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.isOpen = false;
    this.onClose.emit();
  }

  executeAction(action: any) {
    action.callback();
    this.close();
  }

  getHeaderClass(): string {
    const classes: { [key: string]: string } = {
      'success': 'bg-green-50',
      'error': 'bg-red-50',
      'warning': 'bg-yellow-50',
      'info': 'bg-blue-50'
    };
    return classes[this.data.type] || classes['info'];
  }
}
