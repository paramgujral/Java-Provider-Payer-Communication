import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge/priority-badge.component';
import { PayerDashboard, AuthorizationRequest, Notification } from '../../../core/models/models';

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './payer-dashboard.component.html',
  styleUrls: ['./payer-dashboard.component.scss']
})
export class PayerDashboardComponent implements OnInit {
  dashboard     = signal<PayerDashboard | null>(null);
  pendingReqs   = signal<AuthorizationRequest[]>([]);
  notifications = signal<Notification[]>([]);
  loading       = signal(true);

  readonly user = this.auth.currentUser;

  constructor(
    private requestSvc: RequestService,
    private notifSvc: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPendingQueue();
    this.loadNotifications();
  }

  private loadDashboard(): void {
    this.requestSvc.getPayerDashboard().subscribe({
      next: d => { this.dashboard.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  private loadPendingQueue(): void {
    this.requestSvc.getQueue(undefined, undefined).subscribe(reqs => {
      const urgent = reqs.filter(r => r.priority === 'URGENT' || r.priority === 'HIGH');
      const normal = reqs.filter(r => r.priority !== 'URGENT' && r.priority !== 'HIGH');
      this.pendingReqs.set([...urgent, ...normal].slice(0, 6));
    });
  }

  private loadNotifications(): void {
    this.notifSvc.getAll().subscribe(
      n => this.notifications.set(n.filter(x => !x.read).slice(0, 4))
    );
  }

  markRead(id: number): void {
    this.notifSvc.markAsRead(id).subscribe(() =>
      this.notifications.update(list => list.filter(n => n.id !== id))
    );
  }

  approvalRateColor(rate: number): string {
    if (rate >= 70) return 'green';
    if (rate >= 40) return 'yellow';
    return 'red';
  }

  waitDays(createdAt: string): number {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  }

  notifIcon(type: string): string {
    const map: Record<string, string> = {
      REQUEST_APPROVED: 'check_circle', REQUEST_DENIED: 'cancel',
      INFO_REQUESTED: 'info', AI_WARNING: 'warning'
    };
    return map[type] ?? 'notifications';
  }

  notifClass(type: string): string {
    const map: Record<string, string> = {
      REQUEST_APPROVED: 'notif-success', REQUEST_DENIED: 'notif-danger',
      INFO_REQUESTED: 'notif-warning',   AI_WARNING: 'notif-info'
    };
    return map[type] ?? '';
  }
}
