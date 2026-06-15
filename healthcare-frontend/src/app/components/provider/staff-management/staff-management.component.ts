import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffService, StaffMember } from '../../../services/staff.service';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.css']
})
export class StaffManagementComponent implements OnInit {
  staffMembers: StaffMember[] = [];
  isLoading: boolean = false;
  
  showAddModal: boolean = false;
  newStaff = {
    firstName: '',
    lastName: '',
    email: ''
  };

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading = true;
    this.staffService.getStaffMembers().subscribe({
      next: (data) => {
        this.staffMembers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load staff', err);
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.newStaff = { firstName: '', lastName: '', email: '' };
    this.showAddModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  addStaff() {
    if (!this.newStaff.firstName || !this.newStaff.lastName || !this.newStaff.email) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.staffService.addStaffMember(this.newStaff).subscribe({
      next: (member) => {
        this.staffMembers.push(member);
        this.successMessage = `Staff member ${member.firstName} added successfully! An email has been sent.`;
        this.closeAddModal();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to add staff member.';
      }
    });
  }

  toggleStatus(member: StaffMember) {
    const newStatus = !member.active;
    this.staffService.toggleStaffStatus(member.id, newStatus).subscribe({
      next: (updatedMember) => {
        member.active = updatedMember.active;
      },
      error: (err) => {
        alert(err.error || 'Failed to update status');
      }
    });
  }
}
