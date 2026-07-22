import { Component, OnInit } from '@angular/core';
import { SessionAuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-payer-profile',
  templateUrl: './payer-profile.html',
  styleUrls: ['./payer-profile.css']
})
export class PayerProfileComponent implements OnInit {
  fullName = '';
  email = '';
  role = '';
  userId = '';

  constructor(private sessionAuthService: SessionAuthService) {}

  ngOnInit(): void {
    this.fullName = this.sessionAuthService.getFullName() || '—';
    this.email = this.sessionAuthService.getEmail() || '—';
    this.role = this.sessionAuthService.getRole() || '—';
    this.userId = this.sessionAuthService.getUserId() || '—';
  }
}
