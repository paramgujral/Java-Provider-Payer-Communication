// Add these to models.ts — Analytics types

export interface AiIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  field?: string;
  title: string;
  detail: string;
  suggestion?: string;
}

export interface ProviderStat {
  providerName: string;
  organization: string;
  submissionCount: number;
  approvedCount: number;
}

export interface Analytics {
  totalRequests: number;
  totalApproved: number;
  totalDenied: number;
  totalInfoRequested: number;
  totalPending: number;
  overallApprovalRate: number;
  avgTurnaroundHours: number;
  requestsByStatus: Record<string, number>;
  requestsByServiceType: Record<string, number>;
  requestsByPriority: Record<string, number>;
  topDenialReasons: string[];
  topProviders: ProviderStat[];
  highScoreCount: number;
  mediumScoreCount: number;
  lowScoreCount: number;
}
