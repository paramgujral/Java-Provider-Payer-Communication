import { Injectable, signal, computed } from '@angular/core';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: 'ROLE_PROVIDER' | 'ROLE_PAYER' | 'ROLE_PATIENT';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'fhir_connector_session';
  
  // Use Angular Signals for reactive state
  private currentUserSignal = signal<UserSession | null>(null);

  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  userRole = computed(() => this.currentUserSignal()?.role || '');

  constructor() {
    const saved = localStorage.getItem(this.SESSION_KEY);
    if (saved) {
      try {
        this.currentUserSignal.set(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem(this.SESSION_KEY);
      }
    }
  }

  setSession(user: UserSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUserSignal.set(null);
  }
}
