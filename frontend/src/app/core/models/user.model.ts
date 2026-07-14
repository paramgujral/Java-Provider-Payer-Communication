export type UserRole = 'PROVIDER' | 'PAYER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationName: string;
  providerType?: string;
  phone?: string;
  emailVerified: boolean;
  createdAt?: string;
}
