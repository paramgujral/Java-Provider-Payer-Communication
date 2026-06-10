import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Notification, NotificationType } from '../../../core/models/models';

type FilterTab = 'all' | 'unread' | NotificationType;

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  all        = signal<Notification[]>([]);
  loading    = signal(true);
  activeTab  = signal<FilterTab>('all');

  readonly isProvider = this.auth.isProvider;

  readonly tabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: 'all',              label: 'All',            icon: 'notifications' },
    { key: 'unread',           label: 'Unread',         icon: 'mark_email_unread' },
    { key: 'REQUEST_APPROVED', label: 'Approved',       icon: 'check_circle' },
    { key: 'REQUEST_DENIED',   label: 'Denied',         icon: 'cancel' },
    { key: 'INFO_REQUESTED',   label: 'Info Requested', icon: 'info' },
    { key: 'AI_WARNING',       label: 'AI Warnings',    icon: 'smart_toy' },
  ];

  filtered = computed(() => {
    const tab = this.activeTab();
    const list = this.all();
    if (tab === 'all')    return list;
    if (tab === 'unread') return list.filter(n => !n.read);
    return list.filter(n => n.type === tab);
  });

  unreadCount = computed(() => this.all().filter(n => !n.read).length);

  constructor(
    private notifSvc: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.notifSvc.getAll().subscribe({
      next: n  => { this.all.set(n); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: FilterTab): void { this.activeTab.set(tab); }

  markRead(id: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.notifSvc.markAsRead(id).subscribe(() =>
      this.all.update(list => list.map(n => n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllRead(): void {
    this.notifSvc.markAllAsRead().subscribe(() =>
      this.all.update(list => list.map(n => ({ ...n, read: true })))
    );
  }

  detailRoute(n: Notification): string {
    if (!n.requestId) return '';
    const base = this.isProvider() ? '/provider' : '/payer';
    return `${base}/requests/${n.requestId}`;
  }

  notifIcon(type: NotificationType): string {
    const m: Record<NotificationType, string> = {
      REQUEST_APPROVED: 'check_circle',
      REQUEST_DENIED:   'cancel',
      INFO_REQUESTED:   'help_outline',
      AI_WARNING:       'smart_toy'
    };
    return m[type] ?? 'notifications';
  }

  notifColorClass(type: NotificationType): string {
    const m: Record<NotificationType, string> = {
      REQUEST_APPROVED: 'type-approved',
      REQUEST_DENIED:   'type-denied',
      INFO_REQUESTED:   'type-info',
      AI_WARNING:       'type-warning'
    };
    return m[type] ?? '';
  }

  timeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days  > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (mins  > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  tabCount(tab: FilterTab): number {
    const list = this.all();
    if (tab === 'all')    return list.length;
    if (tab === 'unread') return list.filter(n => !n.read).length;
    return list.filter(n => n.type === tab).length;
  }
}
