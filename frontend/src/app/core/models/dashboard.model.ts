import { AuthorizationRequest } from './authorization-request.model';

export interface ProviderDashboardStats {
  totalRequests: number;
  approved: number;
  rejected: number;
  pending: number;
  infoRequested: number;
  recentRequests: AuthorizationRequest[];
}

export interface PayerDashboardStats {
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  totalProcessed: number;
  requestQueue: AuthorizationRequest[];
}
