import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <div *ngFor="let toast of toasts" 
           class="toast-item animate-slideIn max-w-md w-full"
           [ngClass]="getToastClass(toast.type)">
        <div class="flex items-start gap-4">
          <div class="shrink-0 mt-0.5">
            <svg *ngIf="toast.type === 'success'" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <svg *ngIf="toast.type === 'error'" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <svg *ngIf="toast.type === 'warning'" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <svg *ngIf="toast.type === 'info'" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>
          <button (click)="removeToast(toast.id)" class="shrink-0 ml-4">
            <svg class="w-5 h-5 opacity-70 hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private timeouts: Map<string, any> = new Map();

  ngOnInit() {
    // Toast service would be injected here
  }

  ngOnDestroy() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
  }

  getToastClass(type: string): string {
    const classes: { [key: string]: string } = {
      'success': 'bg-green-50 border border-green-200 text-green-900',
      'error': 'bg-red-50 border border-red-200 text-red-900',
      'warning': 'bg-yellow-50 border border-yellow-200 text-yellow-900',
      'info': 'bg-blue-50 border border-blue-200 text-blue-900'
    };
    return classes[type] || classes['info'];
  }

  addToast(toast: Toast) {
    this.toasts.push(toast);
    if (toast.duration) {
      const timeout = setTimeout(() => this.removeToast(toast.id), toast.duration);
      this.timeouts.set(toast.id, timeout);
    }
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
  }
}
