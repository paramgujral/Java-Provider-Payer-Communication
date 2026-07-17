import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProviderPayload, ProviderResponse, ProviderService } from '../../core/services/provider.service';
import { TokenStorageService } from '../../core/services/token-storage';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  providers: ProviderResponse[] = [];
  form: ProviderPayload = {
    providerCode: '',
    hospitalName: '',
    specialization: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    status: 'ACTIVE'
  };
  message = '';
  summary: any = null;

  constructor(
    private providerService: ProviderService,
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    this.loadSummary();
  }

  loadProviders(): void {
    this.providerService.getProviders().subscribe({
      next: (response) => {
        this.providers = response.data ?? [];
      },
      error: () => {
        this.message = 'Unable to load providers.';
      }
    });
  }

  loadSummary(): void {
    const token = this.tokenStorage.getToken();
    if (!token) {
      this.message = 'Please log in again to access provider data.';
      return;
    }

    this.http.get<any>(environment.apiUrl + '/provider/dashboard').subscribe({
      next: (response) => {
        this.summary = response.data;
      },
      error: (error) => {
        this.message = error?.error?.message || 'Unable to load provider dashboard data.';
      }
    });
  }

  submit(): void {
    this.providerService.createProvider(this.form).subscribe({
      next: () => {
        this.message = 'Provider created successfully.';
        this.form = {
          providerCode: '',
          hospitalName: '',
          specialization: '',
          licenseNumber: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          country: '',
          status: 'ACTIVE'
        };
        this.loadProviders();
        this.loadSummary();
      },
      error: (error) => {
        this.message = error?.error?.message || 'Unable to create provider.';
      }
    });
  }
}
