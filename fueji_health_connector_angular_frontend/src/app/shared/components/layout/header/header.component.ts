import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { LayoutService } from '../../../services/layout.service';
import { User } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';

interface AppNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-14 bg-white flex items-center gap-3 px-4 md:px-6 shrink-0"
            style="border-bottom:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.04)">

      <!-- Hamburger (mobile) -->
      <button class="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0" (click)="layout.toggle()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Breadcrumb -->
      <div class="flex items-center gap-1.5 min-w-0 flex-1 text-sm">
        <span class="text-gray-400 hidden sm:block truncate">{{ section }}</span>
        @if (page) {
          <svg class="w-3.5 h-3.5 text-gray-300 shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          <span class="font-semibold text-gray-800 truncate">{{ page }}</span>
        }
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-1.5 shrink-0">

        <!-- FHIR R4 badge -->
        <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
          <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <span class="text-xs font-semibold text-blue-700">FHIR R4</span>
        </div>

        <!-- Live badge -->
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-xs font-medium text-green-700">Live</span>
        </div>

        <!-- Notifications -->
        <div class="relative">
          <button (click)="toggleNotifs()" class="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            @if (unreadCount > 0) {
            <span class="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span class="text-white text-[9px] font-bold leading-none">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            </span>
            }
          </button>
          @if (showNotifs) {
            <div class="absolute right-0 top-11 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100">
              <div class="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <span class="text-sm font-bold text-gray-900">Notifications</span>
                <div class="flex items-center gap-2">
                  @if (unreadCount > 0) {
                  <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">{{ unreadCount }} unread</span>
                  <button (click)="markAllRead()" class="text-xs text-blue-600 hover:underline">Mark all read</button>
                  }
                </div>
              </div>
              @if (notifsLoading) {
              <div class="px-4 py-6 text-center text-xs text-gray-400">Loading...</div>
              } @else if (notifs.length === 0) {
              <div class="px-4 py-8 text-center">
                <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <p class="text-xs text-gray-400">No notifications yet</p>
              </div>
              } @else {
              @for (n of notifs; track n.id) {
                <div class="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer flex items-start gap-3"
                     [class.bg-blue-50]="!n.read"
                     (click)="markRead(n)">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" [ngClass]="getNotifBg(n.type)">
                    <svg class="w-4 h-4" [ngClass]="getNotifColor(n.type)" fill="currentColor" viewBox="0 0 24 24">
                      <path [attr.d]="getNotifIcon(n.type)"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-gray-900">{{ n.title }}</p>
                    <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ formatTime(n.createdAt) }}</p>
                  </div>
                  @if (!n.read) { <span class="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2"></span> }
                </div>
              }
              }
            </div>
          }
        </div>

        <!-- User -->
        <div class="relative">
          <button (click)="toggleMenu()" class="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                 [style.background]="avatarGrad">{{ initials }}</div>
            <div class="hidden sm:block text-left">
              <p class="text-xs font-semibold text-gray-900 leading-tight">{{ user?.firstName }} {{ user?.lastName }}</p>
              <p class="text-xs text-gray-400 leading-tight">{{ user?.role }}</p>
            </div>
            <svg class="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          @if (showMenu) {
            <div class="absolute right-0 top-11 w-48 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100">
              <div class="px-4 py-3 border-b border-gray-50">
                <p class="text-xs font-bold text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
              </div>
              <div class="p-2">
                <a routerLink="/profile" (click)="close()" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  Profile
                </a>
                <button (click)="logout()" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition text-left">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [':host{display:block}']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  showMenu = false;
  showNotifs = false;
  section = '';
  page = '';
  notifs: AppNotif[] = [];
  unreadCount = 0;
  notifsLoading = false;
  private subs: Subscription[] = [];
  private pollId: any;

  get initials() { return ((this.user?.firstName||'')[0]+(this.user?.lastName||'')[0]).toUpperCase()||'?'; }
  get avatarGrad() {
    const r = this.user?.role;
    return r==='SUPER_ADMIN' ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
         : r==='PROVIDER'    ? 'linear-gradient(135deg,#10b981,#3b82f6)'
                             : 'linear-gradient(135deg,#f59e0b,#ef4444)';
  }

  constructor(
    public layout: LayoutService,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.updateBC(this.router.url);
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.updateBC(e.url); this.close(); this.cdr.detectChanges();
      })
    );
    if (isPlatformBrowser(this.platformId)) {
      this.loadUnreadCount();
      this.pollId = setInterval(() => this.loadUnreadCount(), 30000);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.pollId) clearInterval(this.pollId);
  }

  loadUnreadCount(): void {
    this.http.get<any>(`${environment.apiUrl}/api/notifications/unread-count`).subscribe({
      next: (res) => {
        this.unreadCount = res?.data ?? 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadNotifications(): void {
    this.notifsLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/notifications?size=15&page=0`).subscribe({
      next: (res) => {
        const content: any[] = res?.data?.content ?? res?.data ?? [];
        this.notifs = content.map((n: any) => ({
          id:        n.id,
          type:      n.type ?? 'SYSTEM',
          title:     n.title ?? 'Notification',
          message:   n.message ?? '',
          read:      n.read ?? false,
          createdAt: n.createdAt ?? '',
        }));
        this.notifsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.notifsLoading = false; this.cdr.detectChanges(); }
    });
  }

  markRead(n: AppNotif): void {
    if (n.read) return;
    this.http.patch<any>(`${environment.apiUrl}/api/notifications/${n.id}/read`, null).subscribe({
      next: () => {
        n.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  markAllRead(): void {
    this.http.patch<any>(`${environment.apiUrl}/api/notifications/read-all`, null).subscribe({
      next: () => {
        this.notifs.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  toggleNotifs(): void {
    this.showNotifs = !this.showNotifs;
    this.showMenu = false;
    if (this.showNotifs) this.loadNotifications();
  }

  formatTime(ts: string): string {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  getNotifBg(type: string): string {
    const m: Record<string, string> = {
      AUTHORIZATION_APPROVED: 'bg-green-100', AUTHORIZATION_REJECTED: 'bg-red-100',
      AUTHORIZATION_SUBMITTED: 'bg-blue-100', MORE_INFO_REQUIRED: 'bg-orange-100',
      AI_REVIEW_COMPLETED: 'bg-purple-100',   ACCOUNT_CREATED: 'bg-teal-100',
      PASSWORD_RESET: 'bg-yellow-100',         LOGIN_ALERT: 'bg-amber-100',
    };
    return m[type] ?? 'bg-gray-100';
  }

  getNotifColor(type: string): string {
    const m: Record<string, string> = {
      AUTHORIZATION_APPROVED: 'text-green-600', AUTHORIZATION_REJECTED: 'text-red-600',
      AUTHORIZATION_SUBMITTED: 'text-blue-600', MORE_INFO_REQUIRED: 'text-orange-600',
      AI_REVIEW_COMPLETED: 'text-purple-600',   ACCOUNT_CREATED: 'text-teal-600',
      PASSWORD_RESET: 'text-yellow-600',         LOGIN_ALERT: 'text-amber-600',
    };
    return m[type] ?? 'text-gray-500';
  }

  getNotifIcon(type: string): string {
    if (type === 'AUTHORIZATION_APPROVED') return 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
    if (type === 'AUTHORIZATION_REJECTED') return 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
    if (type === 'AI_REVIEW_COMPLETED')    return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z';
    if (type === 'MORE_INFO_REQUIRED')     return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
    if (type === 'ACCOUNT_CREATED')        return 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
    return 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z';
  }

  private updateBC(url: string): void {
    const map: Record<string,[string,string]> = {
      '/admin/dashboard':          ['Administration','Dashboard'],
      '/admin/providers':          ['Administration','Providers'],
      '/admin/payers':             ['Administration','Payers'],
      '/admin/audit-logs':         ['Administration','Audit Logs'],
      '/provider/dashboard':       ['Provider','Dashboard'],
      '/provider/authorizations':  ['Provider','My Requests'],
      '/provider/chat':            ['Provider','Messaging'],
      '/payer/dashboard':          ['Payer','Dashboard'],
      '/payer/review':             ['Payer','Review Queue'],
      '/payer/analytics':          ['Payer','Analytics'],
      '/profile':                  ['Account','Profile'],
    };
    const e = map[url.split('?')[0]];
    this.section = e?.[0] || ''; this.page = e?.[1] || '';
  }

  toggleMenu(): void { this.showMenu = !this.showMenu; this.showNotifs = false; }
  close():       void { this.showMenu = false; this.showNotifs = false; }
  logout(): void {
    this.close();
    this.auth.logout().subscribe({
      next:  () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
