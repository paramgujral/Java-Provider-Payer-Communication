import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge/priority-badge.component';
import { ProviderDashboard, AuthorizationRequest, Notification } from '../../../core/models/models';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit {
  dashboard   = signal<ProviderDashboard | null>(null);
  recentReqs  = signal<AuthorizationRequest[]>([]);
  notifications = signal<Notification[]>([]);
  loading     = signal(true);

  // Animated counters
  animTotal    = signal(0);
  animPending  = signal(0);
  animApproved = signal(0);
  animDenied   = signal(0);

  readonly user = this.auth.currentUser;

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  constructor(
    private requestSvc: RequestService,
    private notifSvc: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRecent();
    this.loadNotifications();
  }

  private loadDashboard(): void {
    this.requestSvc.getProviderDashboard().subscribe({
      next: d => {
        this.dashboard.set(d);
        this.loading.set(false);
        this.animateCount(d.totalRequests,    this.animTotal);
        this.animateCount(d.pendingRequests,  this.animPending);
        this.animateCount(d.approvedRequests, this.animApproved);
        this.animateCount(d.deniedRequests,   this.animDenied);
      },
      error: () => this.loading.set(false)
    });
  }

  private animateCount(target: number, sig: ReturnType<typeof signal<number>>): void {
    sig.set(0);
    if (target === 0) return;
    const step = Math.max(1, Math.ceil(target / 25));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      sig.set(current);
      if (current >= target) clearInterval(timer);
    }, 35);
  }

  private loadRecent(): void {
    this.requestSvc.getMyRequests().subscribe(
      reqs => this.recentReqs.set(reqs.slice(0, 6))
    );
  }

  private loadNotifications(): void {
    this.notifSvc.getAll().subscribe(
      n => this.notifications.set(n.filter(x => !x.read).slice(0, 5))
    );
  }

  markRead(id: number): void {
    this.notifSvc.markAsRead(id).subscribe(() =>
      this.notifications.update(list => list.filter(n => n.id !== id))
    );
  }

  notifIcon(type: string): string {
    const map: Record<string, string> = {
      REQUEST_APPROVED: 'check_circle',
      REQUEST_DENIED:   'cancel',
      INFO_REQUESTED:   'info',
      AI_WARNING:       'warning'
    };
    return map[type] ?? 'notifications';
  }

  notifClass(type: string): string {
    const map: Record<string, string> = {
      REQUEST_APPROVED: 'notif-success',
      REQUEST_DENIED:   'notif-danger',
      INFO_REQUESTED:   'notif-warning',
      AI_WARNING:       'notif-info'
    };
    return map[type] ?? '';
  }

  pct(val: number, total: number): number {
    return total > 0 ? Math.round((val / total) * 100) : 0;
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days  > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins  > 0) return `${mins}m ago`;
    return 'Just now';
  }
}
