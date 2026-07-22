import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterRequest, UserAdministrationService } from '../../module/administration/user-creation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterPageComponent {
  loading = false;
  errorMessage = '';
  successMessage = '';

  registerForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['PROVIDER', Validators.required]
  });

  constructor(
    private formBuilder: FormBuilder,
    private userAdministrationService: UserAdministrationService,
    private router: Router
  ) {}

  handleRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;
    const payload: RegisterRequest = {
      fullName: `${formValue.firstName || ''} ${formValue.lastName || ''}`.trim(),
      email: formValue.email || '',
      password: formValue.password || '',
      role: (formValue.role || 'PROVIDER') as 'ADMIN' | 'PROVIDER' | 'PAYER',
      enabled: true
    };

    this.userAdministrationService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Account created successfully. Please login.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 800);
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = this.resolveRegisterError(error);
      }
    });
  }

  private resolveRegisterError(error: any): string {
    if (error?.status === 0) {
      return 'Cannot reach server. Make sure the backend is running on http://localhost:8080.';
    }

    const apiBody = error?.error;
    const apiMessage = typeof apiBody?.message === 'string' ? apiBody.message : '';

    if (/email already registered/i.test(apiMessage)) {
      return 'This email is already registered. Please login or use a different email.';
    }

    if (/validation failed/i.test(apiMessage) && Array.isArray(apiBody?.errors) && apiBody.errors.length) {
      return apiBody.errors
        .map((item: { field?: string; defaultMessage?: string }) =>
          `${item.field || 'field'}: ${item.defaultMessage || 'invalid'}`
        )
        .join('. ');
    }

    if (apiMessage) {
      return apiMessage;
    }

    return 'Failed to create account. Please try again.';
  }
}
