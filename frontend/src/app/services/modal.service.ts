import { Injectable } from '@angular/core';

declare var bootstrap: any;

@Injectable({ providedIn: 'root' })
export class ModalService {
  open(modalId: string): void {
    const el = document.getElementById(modalId);
    if (el) {
      const modal = new bootstrap.Modal(el);
      modal.show();
    }
  }

  close(modalId: string): void {
    const el = document.getElementById(modalId);
    if (el) {
      const modal = bootstrap.Modal.getInstance(el);
      if (modal) modal.hide();
    }
  }
}