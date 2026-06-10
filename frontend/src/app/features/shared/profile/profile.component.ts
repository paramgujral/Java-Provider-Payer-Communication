import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  copied = signal(false);
  readonly user = this.auth.currentUser;
  readonly isProvider = this.auth.isProvider;

  constructor(readonly auth: AuthService) {}

  copyEmail(): void {
    const email = this.user()?.email;
    if (email) {
      navigator.clipboard.writeText(email).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }

  get initials(): string {
    const name = this.user()?.fullName ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get joinedDate(): string {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
