import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LayoutService } from '../../../services/layout.service';
import { User } from '../../../../core/models';

interface NavItem  { label: string; route: string; icon: string; badge?: number; }
interface NavGroup { title: string; items: NavItem[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (mobileOpen) {
      <div class="fixed inset-0 bg-black/40 z-40 md:hidden" (click)="layout.close()"></div>
    }

    <aside [class]="sidebarCls"
           style="background:#fff;border-right:1px solid #e5e7eb">

      <!-- Brand -->
      <div class="flex items-center gap-3 px-5 py-4 shrink-0" style="border-bottom:1px solid #f3f4f6">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
             style="background:linear-gradient(135deg,#6366f1,#3b82f6)">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="min-w-0">
          <span class="font-bold text-sm text-gray-900 block leading-tight">HealthConnector</span>
          <span class="text-xs text-gray-400 block leading-tight">AI Platform v2.0</span>
        </div>
        <button class="md:hidden ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400" (click)="layout.close()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- User card -->
      <div class="mx-3 mt-3 mb-1 rounded-xl px-3 py-2.5 shrink-0 bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-100">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
               [style.background]="avatarGrad">{{ initials }}</div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-gray-900 truncate">{{ user?.firstName }} {{ user?.lastName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user?.organizationName || user?.email }}</p>
          </div>
          <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold" [ngClass]="roleCls">{{ roleLabel }}</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-3 overflow-y-auto">
        @for (g of groups; track g.title) {
          <div class="mb-4">
            <p class="text-xs font-semibold uppercase text-gray-400 px-2 mb-1.5" style="letter-spacing:.07em">{{ g.title }}</p>
            @for (item of g.items; track item.route) {
              <a [routerLink]="item.route" routerLinkActive="nav-active" (click)="layout.close()"
                 class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-all mb-0.5">
                <svg class="w-4.5 h-4.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path [attr.d]="item.icon"/>
                </svg>
                <span class="flex-1 truncate">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="text-xs px-1.5 py-0.5 rounded-full font-bold bg-red-100 text-red-600">{{ item.badge }}</span>
                }
              </a>
            }
          </div>
        }
      </nav>

      <!-- Bottom -->
      <div class="px-3 pb-4 shrink-0" style="border-top:1px solid #f3f4f6">
        <div class="pt-3 space-y-0.5">
          <a routerLink="/profile" routerLinkActive="nav-active" (click)="layout.close()"
             class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-all">
            <svg class="w-4.5 h-4.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>Profile Settings</span>
          </a>
          <button (click)="logout()" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 transition-all text-left">
            <svg class="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: contents; }
    .nav-item:hover { background:#f5f3ff; color:#4f46e5; }
    :host ::ng-deep .nav-active { background:#ede9fe; color:#4f46e5; font-weight:600; }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  mobileOpen = false;
  groups: NavGroup[] = [];
  private sub!: Subscription;

  get initials() { return ((this.user?.firstName||'')[0]+(this.user?.lastName||'')[0]).toUpperCase()||'?'; }
  get avatarGrad() {
    const r = this.user?.role;
    return r === 'SUPER_ADMIN' ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
         : r === 'PROVIDER'    ? 'linear-gradient(135deg,#10b981,#3b82f6)'
                               : 'linear-gradient(135deg,#f59e0b,#ef4444)';
  }
  get roleLabel() { return ({ SUPER_ADMIN:'Admin', PROVIDER:'Provider', PAYER:'Payer' } as any)[this.user?.role||''] || 'User'; }
  get roleCls()   { return ({ SUPER_ADMIN:'bg-purple-100 text-purple-700', PROVIDER:'bg-blue-100 text-blue-700', PAYER:'bg-green-100 text-green-700' } as any)[this.user?.role||''] || 'bg-gray-100 text-gray-600'; }
  get sidebarCls(): string {
    // Always fixed on mobile (out of normal flow so flex-1 main fills 100% width).
    // Slides off-screen via -translate-x-full when closed; slides in with translate-x-0 when open.
    // md: overrides restore sticky in-flow layout for desktop.
    const base       = 'flex flex-col w-64 h-screen shrink-0 transition-transform duration-300 ease-in-out';
    const mobilePos  = 'fixed top-0 left-0 z-50';
    const slideState = this.mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full';
    const desktop    = 'md:sticky md:top-0 md:translate-x-0 md:z-auto md:shadow-none';
    return `${base} ${mobilePos} ${slideState} ${desktop}`;
  }

  constructor(
    public layout: LayoutService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.sub = this.layout.sidebarOpen$.subscribe(v => {
      this.mobileOpen = v;
      this.cdr.markForCheck();
    });
    this.buildNav();
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private buildNav(): void {
    const r = this.user?.role;
    if (r === 'SUPER_ADMIN') {
      this.groups = [
        { title: 'Workspace', items: [
          { label: 'Dashboard',  route: '/admin/dashboard',  icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' }
        ]},
        { title: 'Management', items: [
          { label: 'Providers',  route: '/admin/providers',  icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.94 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
          { label: 'Payers',     route: '/admin/payers',     icon: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z' },
          { label: 'Audit Logs', route: '/admin/audit-logs', icon: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' }
        ]},
        { title: 'Intelligence', items: [
          { label: 'Analytics',  route: '/admin/analytics', icon: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z' }
        ]}
      ];
    } else if (r === 'PROVIDER') {
      this.groups = [
        { title: 'Workspace', items: [
          { label: 'Dashboard',        route: '/provider/dashboard',      icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' }
        ]},
        { title: 'Authorizations', items: [
          { label: 'My Requests',      route: '/provider/authorizations', icon: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z' },
          { label: 'Secure Messaging', route: '/provider/chat',           icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z' }
        ]}
      ];
    } else {
      this.groups = [
        { title: 'Workspace', items: [
          { label: 'Dashboard',    route: '/payer/dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' }
        ]},
        { title: 'Operations', items: [
          { label: 'Review Queue', route: '/payer/review',    icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
          { label: 'Analytics',   route: '/payer/analytics', icon: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z' }
        ]}
      ];
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next:  () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
