import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  sidebarOpen = signal(true);
  userMenuOpen = signal(false);

  readonly user         = this.auth.currentUser;
  readonly isProvider   = this.auth.isProvider;
  readonly isPayer      = this.auth.isPayer;
  readonly unreadCount  = this.notifService.unreadCount;

  readonly providerNav: NavItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',         route: '/provider/dashboard'      },
    { label: 'My Requests',     icon: 'assignment',        route: '/provider/requests'       },
    { label: 'New Request',     icon: 'add_circle_outline',route: '/provider/requests/new'   },
    { label: 'Status Board',    icon: 'view_kanban',       route: '/provider/kanban'         },
    { label: 'Notifications',   icon: 'notifications',     route: '/provider/notifications'  },
    { label: 'My Profile',      icon: 'account_circle',    route: '/provider/profile'        },
  ];

  readonly payerNav: NavItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',         route: '/payer/dashboard'         },
    { label: 'Review Queue',    icon: 'inbox',             route: '/payer/queue'             },
    { label: 'Status Board',    icon: 'view_kanban',       route: '/payer/kanban'            },
    { label: 'Reports',         icon: 'bar_chart',         route: '/payer/reports'           },
    { label: 'Notifications',   icon: 'notifications',     route: '/payer/notifications'     },
    { label: 'My Profile',      icon: 'account_circle',    route: '/payer/profile'           },
  ];

  readonly navItems = computed(() => this.isProvider() ? this.providerNav : this.payerNav);
  readonly portalLabel = computed(() => this.isProvider() ? 'Provider Portal' : 'Payer Portal');

  constructor(
    readonly auth: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notifService.getUnreadCount().subscribe();
  }

  logout(): void {
    this.auth.logout();
  }

  goToNotifications(): void {
    const base = this.isProvider() ? '/provider' : '/payer';
    this.router.navigate([`${base}/notifications`]);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }
}
