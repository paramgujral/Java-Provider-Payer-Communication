import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthorizationCase, AuthorizationRequest, AiAnalysisResult,
  ProviderDashboard, PayerDashboard, KanbanBoard
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly API = 'http://localhost:8080/api/authorization';

  constructor(private http: HttpClient) {}

  createDraft(request: AuthorizationRequest): Observable<AuthorizationCase> {
    return this.http.post<AuthorizationCase>(`${this.API}/create`, request);
  }

  analyze(request: AuthorizationRequest): Observable<AiAnalysisResult> {
    return this.http.post<AiAnalysisResult>(`${this.API}/analyze`, request);
  }

  submit(caseId: string): Observable<AuthorizationCase> {
    return this.http.post<AuthorizationCase>(`${this.API}/${caseId}/submit`, {});
  }

  aiFix(caseId: string): Observable<AiAnalysisResult> {
    return this.http.post<AiAnalysisResult>(`${this.API}/${caseId}/ai-fix`, {});
  }

  review(caseId: string, decision: string, payerNotes: string, clarificationRequested?: string): Observable<AuthorizationCase> {
    return this.http.post<AuthorizationCase>(`${this.API}/${caseId}/review`, { decision, payerNotes, clarificationRequested });
  }

  clarification(caseId: string, notes: string): Observable<AuthorizationCase> {
    return this.http.post<AuthorizationCase>(`${this.API}/${caseId}/clarification`, { notes });
  }

  getProviderDashboard(): Observable<ProviderDashboard> {
    return this.http.get<ProviderDashboard>(`${this.API}/provider/dashboard`);
  }

  getPayerDashboard(): Observable<PayerDashboard> {
    return this.http.get<PayerDashboard>(`${this.API}/payer/dashboard`);
  }

  getProviderCases(): Observable<AuthorizationCase[]> {
    return this.http.get<AuthorizationCase[]>(`${this.API}/provider/cases`);
  }

  getPayerCases(): Observable<AuthorizationCase[]> {
    return this.http.get<AuthorizationCase[]>(`${this.API}/payer/cases`);
  }

  getKanban(): Observable<KanbanBoard> {
    return this.http.get<KanbanBoard>(`${this.API}/kanban`);
  }

  getCase(caseId: string): Observable<AuthorizationCase> {
    return this.http.get<AuthorizationCase>(`${this.API}/${caseId}`);
  }
}
