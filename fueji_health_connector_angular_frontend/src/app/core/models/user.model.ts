export type UserRole = 'SUPER_ADMIN' | 'PROVIDER' | 'PAYER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  role: UserRole;
  organizationName?: string;
  npi?: string;
  address?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  organizationName: string;
  npi?: string;
  address?: string;
}
