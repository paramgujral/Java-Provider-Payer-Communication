import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../../shared/components/layout/footer/footer.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  template: `
    <div class="min-h-screen bg-linear-to-br from-blue-600 to-blue-800 flex flex-col">
      <div class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="text-center">
          <svg class="w-32 h-32 mx-auto text-white mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h1 class="text-4xl font-bold text-white mb-2">Access Denied</h1>
          <p class="text-blue-100 mb-8 text-lg">You don't have permission to access this resource.</p>
          <button routerLink="/dashboard" class="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold">
            Go to Dashboard
          </button>
        </div>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {}

