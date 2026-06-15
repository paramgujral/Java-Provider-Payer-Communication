import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['snack-success'] });
  }

  error(message: string) {
    this.snackBar.open(message, 'Close', { duration: 4000, panelClass: ['snack-error'] });
  }

  info(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['snack-info'] });
  }
}
