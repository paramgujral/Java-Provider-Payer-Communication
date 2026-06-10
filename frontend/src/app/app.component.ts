import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service';
import { AppNotification } from './models/models';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <div class="mark">A</div>
          <div>
            <div class="name">Authsmith</div>
            <div class="sub">Care Connector</div>
          </div>
        </div>

        <a class="nav-link" routerLink="/provider" routerLinkActive="active">
          <span class="ico">&#9776;</span> Provider
        </a>
        <a class="nav-link" routerLink="/payer" routerLinkActive="active">
          <span class="ico">&#9878;</span> Payer
        </a>
        <a class="nav-link" routerLink="/tracking" routerLinkActive="active">
          <span class="ico">&#9201;</span> Tracking
        </a>

        <div class="nav-spacer"></div>
        <div class="side-foot">
          FHIR R4 &middot; Da Vinci PAS<br>
          Bidirectional prior-authorization<br>
          AI Copilot enabled
        </div>
      </aside>

      <!-- Main column -->
      <div>
        <header class="topbar">
          <div>
            <div class="crumb">{{ role }} WORKSPACE</div>
            <div class="title">{{ pageTitle }}</div>
          </div>
          <div style="display:flex;align-items:center;gap:18px;">
            <div class="bell" (click)="toggleNotifs()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block">
                <rect x="2" y="4" width="16" height="2" rx="1" fill="currentColor"/>
                <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor"/>
                <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
              <span class="count" *ngIf="unread > 0">{{ unread }}</span>
            </div>
          </div>
        </header>

        <!-- Notifications dropdown -->
        <div class="notif-panel" *ngIf="showNotifs">
          <div class="card-head">
            <h3 style="font-size:15px">Notifications</h3>
            <button class="btn btn-ghost btn-sm" (click)="markAll()">Mark all read</button>
          </div>
          <div *ngIf="notifications.length === 0" class="empty" style="padding:28px">No notifications.</div>
          <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.readFlag">
            <div class="lvl" [ngClass]="n.level"></div>
            <div>
              <div class="nt">{{ n.title }}</div>
              <div class="nm">{{ n.message }}</div>
            </div>
          </div>
        </div>

        <main class="main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  role = 'PROVIDER';
  pageTitle = 'New Authorization Request';
  unread = 0;
  showNotifs = false;
  notifications: AppNotification[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.onRoute(e.urlAfterRedirects));
    this.onRoute(this.router.url);
    setInterval(() => this.refreshUnread(), 5000);
  }

  private onRoute(url: string) {
    if (url.includes('payer')) { this.role = 'PAYER'; this.pageTitle = 'Authorization Review Queue'; }
    else if (url.includes('tracking')) { this.role = 'PROVIDER'; this.pageTitle = 'Request Tracking'; }
    else { this.role = 'PROVIDER'; this.pageTitle = 'New Authorization Request'; }
    this.refreshUnread();
    this.showNotifs = false;
  }

  private recipient(): string { return this.role; }

  refreshUnread() {
    this.api.unreadCount(this.recipient()).subscribe({
      next: (r) => (this.unread = r.count),
      error: () => {}
    });
  }

  toggleNotifs() {
    this.showNotifs = !this.showNotifs;
    if (this.showNotifs) {
      this.api.notifications(this.recipient()).subscribe((n) => (this.notifications = n));
    }
  }

  markAll() {
    this.api.markAllRead(this.recipient()).subscribe(() => {
      this.notifications = this.notifications.map((n) => ({ ...n, readFlag: true }));
      this.unread = 0;
    });
  }
}
