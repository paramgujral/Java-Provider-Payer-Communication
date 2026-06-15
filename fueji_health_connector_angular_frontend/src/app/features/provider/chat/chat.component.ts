import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LayoutModule } from '../../../shared/components/layout/layout.module';
import { environment } from '../../../../environments/environment';

interface ChatThread {
  id: string;
  authRef: string;
  patientName: string;
  payerName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  status: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'PROVIDER' | 'PAYER';
  text: string;
  timestamp: string;
  isOwn: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LayoutModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0">
        <app-header></app-header>

        <main class="flex-1 overflow-hidden flex">

          <!-- Thread List (full-screen on mobile when no thread selected, sidebar on desktop) -->
          <div [class]="showMobileList ? 'flex flex-col bg-white border-r border-gray-100 w-full md:w-80 md:shrink-0' : 'hidden md:flex flex-col bg-white border-r border-gray-100 w-80 shrink-0'">
            <div class="px-4 py-4 border-b border-gray-100">
              <h2 class="text-lg font-bold text-gray-900">Messages</h2>
              <p class="text-xs text-gray-500 mt-0.5">Authorization conversations</p>
            </div>
            <div class="flex-1 overflow-y-auto">
              @if (loadingThreads) {
                <div class="px-4 py-8 text-center text-gray-400 text-sm">Loading conversations...</div>
              }
              @if (!loadingThreads && threads.length === 0) {
                <div class="px-4 py-8 text-center">
                  <svg class="w-10 h-10 text-gray-200 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                  <p class="text-gray-400 text-xs">No submitted authorizations yet.</p>
                  <p class="text-gray-300 text-xs mt-1">Submit an authorization to start messaging.</p>
                </div>
              }
              @for (t of threads; track t.id) {
              <button (click)="selectThread(t)"
                      class="w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition"
                      [class.bg-blue-50]="selectedThread?.id === t.id">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <span class="text-xs font-mono font-semibold text-blue-600 truncate">{{ t.authRef }}</span>
                  <span class="text-xs text-gray-400 shrink-0">{{ t.lastTime }}</span>
                </div>
                <p class="text-sm font-medium text-gray-900 truncate">{{ t.patientName }}</p>
                <p class="text-xs text-gray-500 truncate mt-0.5">{{ t.lastMessage || 'No messages yet' }}</p>
                <div class="flex items-center justify-between mt-1.5">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="getStatusClass(t.status)">{{ t.status }}</span>
                  @if (t.unread > 0) {
                  <span class="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{{ t.unread }}</span>
                  }
                </div>
              </button>
              }
            </div>
          </div>

          <!-- Chat Area (hidden on mobile when thread list is showing) -->
          <div [class]="!showMobileList ? 'flex flex-1 flex-col overflow-hidden' : 'hidden md:flex flex-1 flex-col overflow-hidden'">
            @if (!selectedThread) {
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                <p class="text-gray-400 font-medium">Select a conversation</p>
                <p class="text-gray-300 text-sm mt-1">Choose a submitted authorization to message the payer</p>
              </div>
            </div>
            }

            @if (selectedThread) {
            <!-- Thread Header -->
            <div class="px-4 md:px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3 justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <!-- Back button: mobile only -->
                <button (click)="showMobileList = true" class="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-bold text-gray-900 truncate">{{ selectedThread.patientName }}</h3>
                    <span class="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">{{ selectedThread.authRef }}</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5 truncate">{{ selectedThread.payerName }} &bull; {{ selectedThread.status }}</p>
                </div>
              </div>
              <button (click)="refreshMessages()" class="text-gray-400 hover:text-blue-600 transition shrink-0" title="Refresh messages">
                <svg class="w-5 h-5" [class.animate-spin]="loadingMessages" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            </div>

            <!-- Messages -->
            <div #messagesContainer class="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              @if (loadingMessages) {
                <div class="text-center text-gray-400 text-sm py-8">Loading messages...</div>
              }
              @if (!loadingMessages && currentMessages.length === 0) {
                <div class="text-center text-gray-400 text-sm py-8">
                  No messages yet. Start the conversation with the payer.
                </div>
              }
              @for (msg of currentMessages; track msg.id) {
              <div class="flex" [class.justify-end]="msg.isOwn">
                @if (!msg.isOwn) {
                <div class="flex items-end gap-2 max-w-sm">
                  <div class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs shrink-0 mb-1">
                    {{ msg.senderName ? msg.senderName[0] : 'P' }}
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 mb-1 ml-1">{{ msg.senderName || 'Payer' }}</p>
                    <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm">
                      <p class="text-sm text-gray-800">{{ msg.text }}</p>
                    </div>
                    <p class="text-xs text-gray-400 mt-1 ml-1">{{ formatTime(msg.timestamp) }}</p>
                  </div>
                </div>
                } @else {
                <div class="flex items-end gap-2 max-w-sm">
                  <div>
                    <p class="text-xs text-gray-400 mb-1 mr-1 text-right">You</p>
                    <div class="bg-blue-600 text-white rounded-2xl rounded-br-none px-4 py-2.5 shadow-sm">
                      <p class="text-sm">{{ msg.text }}</p>
                    </div>
                    <p class="text-xs text-gray-400 mt-1 mr-1 text-right">{{ formatTime(msg.timestamp) }}</p>
                  </div>
                  <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0 mb-1">Me</div>
                </div>
                }
              </div>
              }
            </div>

            <!-- Message Input -->
            <div class="px-6 py-4 bg-white border-t border-gray-100">
              <div class="flex items-end gap-3">
                <div class="flex-1">
                  <textarea [(ngModel)]="newMessage" (keydown.enter)="onEnter($event)"
                            rows="1" placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none bg-gray-50 focus:bg-white transition"
                            style="min-height: 44px; max-height: 128px">
                  </textarea>
                </div>
                <button (click)="sendMessageBtn()" [disabled]="!newMessage.trim() || sending"
                        class="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  <svg class="w-5 h-5" [class.animate-spin]="sending" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-2 text-center">Messages are encrypted and stored securely — HIPAA compliant</p>
            </div>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    .typing-dot { animation: typingBounce 1.2s infinite ease-in-out; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  threads: ChatThread[] = [];
  currentMessages: Message[] = [];
  selectedThread: ChatThread | null = null;
  showMobileList = true;
  newMessage = '';
  loadingThreads = false;
  loadingMessages = false;
  sending = false;
  private shouldScroll = false;
  private pollInterval: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadThreads();
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private loadThreads(): void {
    this.loadingThreads = true;
    this.http.get<any>(`${environment.apiUrl}/api/authorizations/my?size=50`).subscribe({
      next: (res) => {
        const list: any[] = res?.data?.content ?? res?.data ?? [];
        this.threads = list
          .filter((a: any) => a.status !== 'DRAFT')
          .map((a: any) => this.mapThread(a));
        this.loadingThreads = false;
        if (this.threads.length > 0) this.selectThread(this.threads[0]);
        this.cdr.markForCheck();
      },
      error: () => { this.loadingThreads = false; this.cdr.markForCheck(); }
    });
  }

  private mapThread(a: any): ChatThread {
    return {
      id:           a.id ?? '',
      authRef:      a.referenceNumber ?? '',
      patientName:  a.patientName ?? 'Unknown Patient',
      payerName:    a.payerName ?? a.payerOrganizationName ?? 'Payer',
      lastMessage:  '',
      lastTime:     a.submittedAt ? this.formatRelative(a.submittedAt) : (a.createdAt ? this.formatRelative(a.createdAt) : ''),
      unread:       0,
      status:       a.status ?? '',
    };
  }

  selectThread(t: ChatThread): void {
    this.selectedThread = t;
    this.showMobileList = false;
    t.unread = 0;
    this.currentMessages = [];
    this.loadMessages(t.id);
    this.cdr.markForCheck();
  }

  refreshMessages(): void {
    if (this.selectedThread) this.loadMessages(this.selectedThread.id);
  }

  private loadMessages(authorizationId: string): void {
    this.loadingMessages = true;
    this.cdr.markForCheck();
    this.http.get<any>(`${environment.apiUrl}/api/chat/authorizations/${authorizationId}/messages?size=100`).subscribe({
      next: (res) => {
        const list: any[] = res?.data?.content ?? res?.data ?? [];
        this.currentMessages = list.map(m => this.mapMessage(m));
        if (this.currentMessages.length > 0) {
          const last = this.currentMessages[this.currentMessages.length - 1];
          if (this.selectedThread) {
            this.selectedThread.lastMessage = last.text;
            this.selectedThread.lastTime    = this.formatRelative(last.timestamp);
          }
        }
        this.loadingMessages = false;
        this.shouldScroll = true;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingMessages = false; this.cdr.markForCheck(); }
    });
  }

  private mapMessage(m: any): Message {
    const myId = this.getMyUserId();
    return {
      id:         m.id ?? '',
      senderId:   m.senderId ?? '',
      senderName: m.senderName ?? '',
      senderRole: (m.senderRole ?? 'PROVIDER') as 'PROVIDER' | 'PAYER',
      text:       m.content ?? '',
      timestamp:  m.timestamp ?? m.createdAt ?? '',
      isOwn:      m.senderId === myId || m.senderRole === 'PROVIDER',
    };
  }

  private getMyUserId(): string {
    try {
      const token = localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken') ?? '';
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? payload.userId ?? '';
    } catch { return ''; }
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) { event.preventDefault(); this.sendMessageBtn(); }
  }

  sendMessageBtn(): void {
    if (!this.newMessage.trim() || !this.selectedThread || this.sending) return;
    const text = this.newMessage.trim();
    this.newMessage = '';
    this.sending = true;
    this.cdr.markForCheck();

    this.http.post<any>(
      `${environment.apiUrl}/api/chat/authorizations/${this.selectedThread.id}/messages`,
      { content: text }
    ).subscribe({
      next: (res) => {
        const m = res?.data ?? res;
        const msg: Message = {
          id:         m?.id ?? Date.now().toString(),
          senderId:   m?.senderId ?? 'me',
          senderName: m?.senderName ?? 'You',
          senderRole: 'PROVIDER',
          text:       m?.content ?? text,
          timestamp:  m?.timestamp ?? new Date().toISOString(),
          isOwn:      true,
        };
        this.currentMessages.push(msg);
        if (this.selectedThread) {
          this.selectedThread.lastMessage = msg.text;
          this.selectedThread.lastTime    = 'Just now';
        }
        this.shouldScroll = true;
        this.sending = false;
        this.cdr.markForCheck();
      },
      error: () => { this.sending = false; this.newMessage = text; this.cdr.markForCheck(); }
    });
  }

  getStatusClass(status: string): string {
    const m: Record<string, string> = {
      SUBMITTED:            'bg-blue-100 text-blue-700',
      UNDER_REVIEW:         'bg-purple-100 text-purple-700',
      APPROVED:             'bg-green-100 text-green-700',
      REJECTED:             'bg-red-100 text-red-700',
      MORE_INFO_REQUIRED:   'bg-amber-100 text-amber-700',
    };
    return m[status] ?? 'bg-gray-100 text-gray-600';
  }

  formatTime(ts: string): string {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private formatRelative(ts: string): string {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer)
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
