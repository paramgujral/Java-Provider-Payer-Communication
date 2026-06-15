import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin">
        <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"></circle>
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" 
                  stroke-dasharray="65" stroke-dashoffset="0" style="animation: rotate 1s linear infinite;"></circle>
        </svg>
      </div>
    </div>
  `,
  styles: []
})
export class LoaderComponent {}
