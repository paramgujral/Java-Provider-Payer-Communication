export interface AIMissingField {
  field: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
}

export interface AIRecommendation {
  category: string;
  message: string;
  suggestion: string;
  reason: string;
}

export interface AIAutoCorrection {
  field: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
}

export interface AIWarning {
  type: string;
  message: string;
}

export interface AIValidationResponse {
  qualityScore: number;
  approvalProbability: 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  overallStatus: 'PASS' | 'NEEDS_ATTENTION' | 'CRITICAL_ISSUES';
  missingFields: AIMissingField[];
  recommendations: AIRecommendation[];
  autoCorrections: AIAutoCorrection[];
  clinicalSummary: string;
  requiredDocuments: string[];
  warnings: AIWarning[];
}
