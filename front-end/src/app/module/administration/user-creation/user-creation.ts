import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterRequest, UserCreationService } from '../user-creation.service';

@Component({
  selector: 'app-user-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-creation.html',
  styleUrl: './user-creation.css',
})
export class UserCreation {

  private fb = inject(FormBuilder);
  private userService = inject(UserCreationService);

  loading = false;
  successMessage = '';
  errorMessage = '';

  userForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
    enabled: [true]
  });

  saveUser() {

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const payload = this.userForm.getRawValue() as RegisterRequest;

    this.userService.register(payload).subscribe({
      next: (response) => {


        this.successMessage = 'User created successfully';

        this.userForm.reset({
          enabled: true
        });

        this.loading = false;
      },

      error: (error:any) => {

        console.error(error);

        this.errorMessage =
          error.error?.message || 'Failed to create user';

        this.loading = false;
      }
    });
  }
}
