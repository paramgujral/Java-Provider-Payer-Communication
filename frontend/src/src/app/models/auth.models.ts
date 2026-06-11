export interface LoginRequest {
  roleId: number;
  roleName: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  roleId: number;
  userId: string;
  message: string;
}

export interface CurrentUser {
  token: string;
  username: string;
  role: string;
  roleId: number;
  userId: string;
}

export enum UserRole {
  PROVIDER = 'Provider',
  PAYER = 'Payer'
}

export enum RoleId {
  PROVIDER = 1,
  PAYER = 2
}
