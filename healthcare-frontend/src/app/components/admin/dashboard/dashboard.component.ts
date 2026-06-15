import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserDto } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { UserProfileModalComponent, UserProfileData } from '../../shared/user-profile-modal/user-profile-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UserProfileModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  showProfileModal = false;
  showRegisterModal = false;
  selectedProfileData: UserProfileData | null = null;
  loading = true;
  registerLoading = false;
  registerError = '';
  registerSuccess = '';
  currentFilter: string = 'All';
  searchQuery: string = '';
  
  registerForm: FormGroup;

  // KPIs
  totalUsers = 0;
  activeProviders = 0;
  activePayers = 0;
  inactiveUsers = 0;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private fb: FormBuilder
  ) { 
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['PROVIDER', Validators.required],
      organizationId: ['', Validators.required],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.calculateKPIs();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.loading = false;
      }
    });
  }

  calculateKPIs() {
    this.totalUsers = this.users.length;
    this.activeProviders = this.users.filter(u => u.active && u.role === 'PROVIDER').length;
    this.activePayers = this.users.filter(u => u.active && u.role === 'PAYER').length;
    this.inactiveUsers = this.users.filter(u => !u.active).length;
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.users;

    // Apply pill filters
    if (this.currentFilter === 'Providers') {
      filtered = filtered.filter(u => u.role === 'PROVIDER');
    } else if (this.currentFilter === 'Payers') {
      filtered = filtered.filter(u => u.role === 'PAYER');
    } else if (this.currentFilter === 'Inactive') {
      filtered = filtered.filter(u => !u.active);
    }

    // Apply text search
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(u =>
        (u.firstName?.toLowerCase().includes(q)) ||
        (u.lastName?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.organizationId?.toLowerCase().includes(q)) ||
        (u.role?.toLowerCase().includes(q))
      );
    }

    this.filteredUsers = filtered;
  }

  toggleUserStatus(user: UserDto) {
    const newStatus = !user.active;
    this.adminService.toggleUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.calculateKPIs();
          this.applyFilters();
        }
      },
      error: (err) => console.error('Failed to toggle status', err)
    });
  }

  viewUserProfile(user: UserDto) {
    this.selectedProfileData = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      active: user.active,
      avatarInitials: this.getInitials(user.firstName, user.lastName)
    };
    this.showProfileModal = true;
  }

  getInitials(first: string, last: string): string {
    return ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase() || 'U';
  }

  openRegisterModal() {
    this.registerForm.reset({ role: 'PROVIDER' });
    this.registerError = '';
    this.registerSuccess = '';
    this.showRegisterModal = true;
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.registerLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    this.authService.registerByAdmin(this.registerForm.value).subscribe({
      next: (newUser: UserDto) => {
        this.registerLoading = false;
        this.registerSuccess = 'User registered successfully!';
        this.users.unshift(newUser);
        this.calculateKPIs();
        this.applyFilters();
        setTimeout(() => this.closeRegisterModal(), 2000);
      },
      error: (err) => {
        this.registerLoading = false;
        this.registerError = err.error || err.message || 'Registration failed';
      }
    });
  }
}
