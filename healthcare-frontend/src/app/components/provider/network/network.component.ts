import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworkService, NetworkAffiliationDto, NetworkMessageDto } from '../../../services/network.service';
import { ReferenceService, Payer } from '../../../services/reference.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

interface PayerNetworkView extends Payer {
  affiliationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUESTED';
  affiliationId?: string;
}

@Component({
  selector: 'app-provider-network',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network.component.html',
  styleUrl: './network.component.css'
})
export class ProviderNetworkComponent implements OnInit {
  payers: PayerNetworkView[] = [];
  loading = true;
  requesting: string | null = null;
  providerId: string = '';
  activeTab: 'directory' | 'messages' = 'directory';
  selectedChatPayer: PayerNetworkView | null = null;
  chatMessage: string = '';
  currentChatMessages: NetworkMessageDto[] = [];
  searchQuery: string = '';
  private chatSubscription?: Subscription;

  get filteredPayers(): PayerNetworkView[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.payers;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.payers.filter(p => 
      (p.companyName && p.companyName.toLowerCase().includes(q)) || 
      (p.payerId && p.payerId.toLowerCase().includes(q))
    );
  }

  get approvedPayers(): PayerNetworkView[] {
    return this.payers.filter(p => p.affiliationStatus === 'APPROVED');
  }

  constructor(
    private networkService: NetworkService,
    private referenceService: ReferenceService,
    private authService: AuthService
  ) {
    this.providerId = localStorage.getItem('organizationId') || '';
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
    this.referenceService.getPayers().subscribe({
      next: (payerList) => {
        this.payers = payerList.map(p => ({ ...p, affiliationStatus: 'NOT_REQUESTED' }));

        // Fetch current affiliations
        this.networkService.getProviderAffiliations(this.providerId).subscribe({
          next: (affiliations) => {
            affiliations.forEach(aff => {
              const p = this.payers.find(x => x.payerId === aff.payerId);
              if (p) {
                p.affiliationStatus = aff.status;
                p.affiliationId = aff.id;
              }
            });
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  requestAffiliation(payer: PayerNetworkView) {
    this.requesting = payer.payerId;
    this.networkService.requestAffiliation({
      providerId: this.providerId,
      payerId: payer.payerId,
      notes: 'Standard network affiliation request'
    }).subscribe({
      next: (res) => {
        payer.affiliationStatus = res.status;
        payer.affiliationId = res.id;
        this.requesting = null;
      },
      error: (err) => {
        console.error('Failed to request affiliation', err);
        alert('Failed to request affiliation. ' + (err.error || ''));
        this.requesting = null;
      }
    });
  }

  setTab(tab: 'directory' | 'messages') {
    this.activeTab = tab;
  }

  openChat(payer: PayerNetworkView) {
    if (payer.affiliationStatus === 'APPROVED' && payer.affiliationId) {
      if (this.selectedChatPayer?.payerId !== payer.payerId) {
        this.currentChatMessages = []; // clear chat when switching payers
      }
      this.selectedChatPayer = payer;
      this.activeTab = 'messages';
      
      // Load historical messages from backend
      this.networkService.getMessages(payer.affiliationId).subscribe({
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
      this.chatSubscription = this.networkService.watchChat(payer.affiliationId).subscribe(msg => {
        if (!this.currentChatMessages.find(m => m.id === msg.id)) {
          this.currentChatMessages.push(msg);
        }
      });
    }
  }

  sendMessage() {
    if (!this.chatMessage.trim() || !this.selectedChatPayer || !this.selectedChatPayer.affiliationId) return;
    
    this.networkService.sendMessage(
      this.selectedChatPayer.affiliationId,
      this.providerId,
      'PROVIDER',
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
