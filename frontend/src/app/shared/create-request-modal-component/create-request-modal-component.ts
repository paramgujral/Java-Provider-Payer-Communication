import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-create-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-request-modal-component.html'
})
export class CreateRequestModalComponent {
  @Output() created = new EventEmitter<void>();
  patientId = '';
  serviceType = '';
  payerId = 1;
  loading = false;
  error = '';

  constructor(private api: ApiService, private modal: ModalService) {}

  open(): void {
    this.modal.open('createRequestModal');
  }

  create(): void {
    this.loading = true;
    this.error = '';
    this.api.createRequest({
      patientId: this.patientId,
      serviceType: this.serviceType,
      payerId: this.payerId
    }).subscribe({
      next: () => {
        this.loading = false;
        this.created.emit();
        this.modal.close('createRequestModal');
        this.patientId = '';
        this.serviceType = '';
        this.payerId = 1;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Creation failed';
      }
    });
  }
}