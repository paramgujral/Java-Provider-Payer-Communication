import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { AppNotification } from './models/models';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <ng-container *ngIf="!isAuthPage; else authPage">
      <div class="shell">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-brand">
            <span class="brand-icon">🏥</span>
            <span class="brand-name">HealthConnect<span class="brand-ai">AI</span></span>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section" *ngIf="authService.isProvider">
              <span class="nav-label">Provider</span>
              <a routerLink="/provider/dashboard" routerLinkActive="active" class="nav-item">
                <span class="nav-icon">📊</span> Dashboard
              </a>
              <a routerLink="/provider/new-request" routerLinkActive="active" class="nav-item">
                <span class="nav-icon">➕</span> New Request
              </a>
            </div>

            <div class="nav-section" *ngIf="authService.isPayer">
              <span class="nav-label">Payer</span>
              <a routerLink="/payer/dashboard" routerLinkActive="active" class="nav-item">
                <span class="nav-icon">📋</span> Queue
              </a>
            </div>

            <div class="nav-section">
              <span class="nav-label">Workspace</span>
              <a routerLink="/status" routerLinkActive="active" class="nav-item">
                <span class="nav-icon">🗂️</span> Kanban Board
              </a>
            </div>
          </nav>

          <div class="sidebar-footer">
            <div class="user-info">
              <div class="user-avatar">{{ userInitials }}</div>
              <div class="user-details">
                <span class="user-name">{{ authService.currentUser?.fullName }}</span>
                <span class="user-role">{{ authService.currentUser?.role }}</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="logout()">Logout</button>
          </div>
        </aside>

        <!-- Main content -->
        <div class="main-area">
          <!-- Top bar -->
          <header class="topbar">
            <div class="topbar-left">
              <span class="page-title">{{ pageTitle }}</span>
            </div>
            <div class="topbar-right">
              <div class="notif-btn" (click)="toggleNotifications()">
                <span>🔔</span>
                <span class="notif-badge-count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </div>
              <span class="org-tag">{{ authService.currentUser?.organization }}</span>
            </div>
          </header>

          <!-- Notification Drawer -->
          <div class="notif-drawer" *ngIf="showNotifications">
            <div class="notif-drawer-header">
              <h4>Notifications</h4>
              <button class="btn btn-ghost btn-sm" (click)="markAllRead()">Mark all read</button>
            </div>
            <div class="notif-list">
              <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.isRead" (click)="openCase(n)">
                <span class="notif-badge" [class]="n.type">{{ n.type }}</span>
                <div class="notif-content">
                  <strong>{{ n.title }}</strong>
                  <p>{{ n.message }}</p>
                  <small>{{ formatTime(n.createdAt) }}</small>
                </div>
              </div>
              <div *ngIf="notifications.length === 0" class="notif-empty">No notifications</div>
            </div>
          </div>
          <div class="notif-overlay" *ngIf="showNotifications" (click)="showNotifications = false"></div>

          <main class="content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </ng-container>
    <ng-template #authPage>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; }

    .sidebar {
      width: 220px; min-width: 220px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex; flex-direction: column;
      padding: 16px 0;
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 10px;
      padding: 4px 20px 20px;
      font-size: 15px; font-weight: 700; color: var(--text-primary);
      .brand-icon { font-size: 20px; }
      .brand-ai { color: var(--accent-blue); }
    }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 0 8px; }
    .nav-section { margin-bottom: 20px; }
    .nav-label { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; padding: 0 12px 6px; display: block; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; border-radius: var(--radius-md);
      color: var(--text-secondary); font-size: 13px; font-weight: 500;
      text-decoration: none; transition: all 0.15s;
      &:hover { background: var(--bg-tertiary); color: var(--text-primary); text-decoration: none; }
      &.active { background: rgba(88,166,255,0.1); color: var(--accent-blue); }
      .nav-icon { font-size: 15px; }
    }
    .sidebar-footer { border-top: 1px solid var(--border-color); padding: 16px 12px 8px; }
    .user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff;
    }
    .user-details { display: flex; flex-direction: column; }
    .user-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .user-role { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }

    .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 56px; min-height: 56px;
      background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);
    }
    .topbar-left .page-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .notif-btn {
      position: relative; cursor: pointer; font-size: 18px; padding: 4px;
      &:hover { opacity: 0.8; }
    }
    .notif-badge-count {
      position: absolute; top: -4px; right: -4px;
      background: var(--accent-red); color: #fff;
      font-size: 10px; font-weight: 700;
      width: 16px; height: 16px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .org-tag { font-size: 12px; color: var(--text-muted); background: var(--bg-tertiary); padding: 4px 8px; border-radius: var(--radius-sm); }

    .content { flex: 1; overflow-y: auto; padding: 24px; }

    .notif-drawer {
      position: fixed; top: 56px; right: 0; width: 360px;
      background: var(--bg-card); border-left: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg); z-index: 500; max-height: 70vh;
      display: flex; flex-direction: column;
    }
    .notif-drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid var(--border-color);
      h4 { margin: 0; font-size: 13px; font-weight: 600; }
    }
    .notif-list { overflow-y: auto; flex: 1; }
    .notif-item {
      display: flex; gap: 10px; padding: 12px 16px;
      border-bottom: 1px solid rgba(48,54,61,0.5); cursor: pointer;
      transition: background 0.1s;
      &:hover { background: var(--bg-tertiary); }
      &.unread { background: rgba(88,166,255,0.04); }
    }
    .notif-badge { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; height: fit-content;
      &.CRITICAL   { background: rgba(248,81,73,0.15); color: var(--accent-red); }
      &.WARNING    { background: rgba(210,153,34,0.15); color: var(--accent-yellow); }
      &.SUCCESS    { background: rgba(63,185,80,0.15); color: var(--accent-green); }
      &.AI_INSIGHT { background: rgba(88,166,255,0.15); color: var(--accent-blue); }
    }
    .notif-content {
      flex: 1; min-width: 0;
      strong { font-size: 12px; display: block; color: var(--text-primary); }
      p { margin: 2px 0; font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      small { font-size: 10px; color: var(--text-muted); }
    }
    .notif-empty { padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; }
    .notif-overlay { position: fixed; inset: 0; z-index: 499; }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  showNotifications = false;
  private subs: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.notificationService.unreadCount.subscribe(c => this.unreadCount = c)
    );
    if (this.authService.isLoggedIn) {
      this.notificationService.refreshUnreadCount();
      // Poll every 30s
      this.subs.push(
        interval(30000).subscribe(() => {
          if (this.authService.isLoggedIn) this.notificationService.refreshUnreadCount();
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get isAuthPage(): boolean {
    return this.router.url === '/login' || !this.authService.isLoggedIn;
  }

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('provider/dashboard')) return 'Provider Dashboard';
    if (url.includes('provider/new-request')) return 'New Authorization Request';
    if (url.includes('payer/dashboard')) return 'Payer Review Queue';
    if (url.includes('status')) return 'Kanban Board';
    if (url.includes('case/')) return 'Case Detail';
    return 'HealthConnectAI';
  }

  get userInitials(): string {
    return (this.authService.currentUser?.fullName || 'U')
      .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.getNotifications().subscribe(n => this.notifications = n);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  openCase(n: AppNotification): void {
    this.showNotifications = false;
    if (n.relatedCaseId) this.router.navigate(['/case', n.relatedCaseId]);
  }

  formatTime(ts: string): string {
    if (!ts) return '';
    return new Date(ts).toLocaleString();
  }

  logout(): void {
    this.authService.logout();
  }
}
