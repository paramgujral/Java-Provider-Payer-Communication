import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <span>Healthcare Insurance Management System</span>
      <span class="muted">2026</span>
    </footer>
  `,
  styles: [
    `
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 22px;
        background: #0f172a;
        color: #e2e8f0;
        font-size: 13px;
      }
      .muted {
        color: #94a3b8;
      }
      @media (max-width: 720px) {
        .footer {
          flex-direction: column;
          gap: 6px;
          text-align: center;
        }
      }
    `
  ]
})
export class FooterComponent {}
