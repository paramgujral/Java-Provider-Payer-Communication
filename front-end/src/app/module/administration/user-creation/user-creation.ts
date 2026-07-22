import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators
} from '@angular/forms';
import { RegisterRequest, UserAdministrationService } from '../user-creation.service';

@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.html',
  styleUrls: ['./user-creation.css'],
})
export class UserManagementComponent {
  loading = false;
  successMessage = '';
  errorMessage = '';

  userForm = this.formBuilder.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
    enabled: [true]
  });

  constructor(
    private formBuilder: FormBuilder,
    private userAdministrationService: UserAdministrationService
  ) {}

  createUserAccount(): void {

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    const payload = this.userForm.getRawValue() as RegisterRequest;

    this.userAdministrationService.register(payload).subscribe({
      next: () => {
        this.successMessage = 'User created successfully';

        this.userForm.reset({
          enabled: true
        });

        this.loading = false;
      },

      error: (error: any) => {

        console.error(error);

        this.errorMessage =
          error.error?.message || 'Failed to create user';

        this.loading = false;
      }
    });
  }
}
