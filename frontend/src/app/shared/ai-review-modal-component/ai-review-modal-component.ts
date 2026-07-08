import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiReview } from '../../models/request.model';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-ai-review-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-review-modal-component.html'
})
export class AiReviewModalComponent {
  @Input() review!: AiReview;

  constructor(private modal: ModalService) {}

  open(): void {
    this.modal.open('aiReviewModal');
  }

  close(): void {
    this.modal.close('aiReviewModal');
  }
}