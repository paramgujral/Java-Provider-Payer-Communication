import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService, NetworkAffiliationDto, NetworkMessageDto } from '../../../services/network.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payer-credentialing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credentialing.component.html',
  styleUrl: './credentialing.component.css'
})
export class PayerCredentialingComponent implements OnInit {
  requests: NetworkAffiliationDto[] = [];
  loading = true;
  updating: string | null = null;
  payerId: string = '';
  activeTab: 'directory' | 'messages' = 'directory';
  selectedChatProvider: NetworkAffiliationDto | null = null;
  chatMessage: string = '';
  currentChatMessages: NetworkMessageDto[] = [];
  searchQuery: string = '';
  private chatSubscription?: Subscription;

  get filteredRequests(): NetworkAffiliationDto[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.requests;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.requests.filter(r => 
      (r.providerName && r.providerName.toLowerCase().includes(q)) || 
      (r.providerId && r.providerId.toLowerCase().includes(q))
    );
  }

  get approvedProviders(): NetworkAffiliationDto[] {
    return this.requests.filter(r => r.status === 'APPROVED');
  }

  constructor(
    private networkService: NetworkService,
    private authService: AuthService
  ) {
    this.payerId = localStorage.getItem('organizationId') || '';
  }

  ngOnInit() {
    this.networkService.initWebSocket(this.authService.getToken() || '');
    this.loadData();
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  loadData() {
    this.loading = true;
    this.networkService.getPayerAffiliations(this.payerId).subscribe({
      next: (data) => {
        // Sort pending first
        this.requests = data.sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          return new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime();
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  updateStatus(req: NetworkAffiliationDto, status: 'APPROVED' | 'REJECTED') {
    if (!req.id) return;
    this.updating = req.id;
    this.networkService.updateAffiliationStatus(req.id, status).subscribe({
      next: (updated) => {
        req.status = updated.status;
        this.updating = null;
      },
      error: (err) => {
        console.error('Failed to update status', err);
        alert('Failed to update status.');
        this.updating = null;
      }
    });
  }

  setTab(tab: 'directory' | 'messages') {
    this.activeTab = tab;
  }

  openChat(req: NetworkAffiliationDto) {
    if (req.status === 'APPROVED' && req.id) {
      if (this.selectedChatProvider?.providerId !== req.providerId) {
        this.currentChatMessages = [];
      }
      this.selectedChatProvider = req;
      this.activeTab = 'messages';
      
      // Load historical messages from backend
      this.networkService.getMessages(req.id).subscribe({
        next: (messages) => {
          this.currentChatMessages = messages;
        },
        error: (err) => {
          console.error('Failed to load messages', err);
        }
      });

      // Subscribe to real-time updates
      if (this.chatSubscription) {
        this.chatSubscription.unsubscribe();
      }
      this.chatSubscription = this.networkService.watchChat(req.id).subscribe(msg => {
        if (!this.currentChatMessages.find(m => m.id === msg.id)) {
          this.currentChatMessages.push(msg);
        }
      });
    }
  }

  sendMessage() {
    if (!this.chatMessage.trim() || !this.selectedChatProvider || !this.selectedChatProvider.id) return;
    
    this.networkService.sendMessage(
      this.selectedChatProvider.id,
      this.payerId,
      'PAYER',
      this.chatMessage
    ).subscribe({
      next: (msg) => {
        // Only push if not already received via WebSocket
        if (!this.currentChatMessages.find(m => m.id === msg.id)) {
          this.currentChatMessages.push(msg);
        }
        this.chatMessage = '';
      },
      error: (err) => {
        console.error('Failed to send message', err);
        alert('Failed to send message');
      }
    });
  }
}
