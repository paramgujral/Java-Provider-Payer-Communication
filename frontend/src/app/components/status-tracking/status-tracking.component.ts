import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { KanbanBoard, AuthorizationCase } from '../../models/models';

@Component({
  selector: 'app-status-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="kanban-wrap">
      <div class="kanban-header">
        <h2>FHIR Authorization Kanban Board</h2>
        <p class="sub">5-column workflow · Real-time status tracking</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div><span>Loading Kanban...</span>
      </div>

      <div class="kanban-board" *ngIf="!loading && board">
        <!-- DRAFT -->
        <div class="kanban-col">
          <div class="col-header draft">
            <span class="col-icon">📝</span>
            <span class="col-title">Draft</span>
            <span class="col-count">{{ board.DRAFT.length }}</span>
          </div>
          <div class="col-cards">
            <div *ngFor="let c of board.DRAFT" class="kanban-card draft-card" [routerLink]="['/case', c['caseId']]">
              <ng-container *ngTemplateOutlet="cardTpl; context:{c:c}"></ng-container>
            </div>
            <div *ngIf="board.DRAFT.length === 0" class="col-empty">No drafts</div>
          </div>
        </div>

        <!-- TRANSMITTED -->
        <div class="kanban-col">
          <div class="col-header transmitted">
            <span class="col-icon">📤</span>
            <span class="col-title">Transmitted</span>
            <span class="col-count">{{ board.TRANSMITTED.length }}</span>
          </div>
          <div class="col-cards">
            <div *ngFor="let c of board.TRANSMITTED" class="kanban-card transmitted-card" [routerLink]="['/case', c['caseId']]">
              <ng-container *ngTemplateOutlet="cardTpl; context:{c:c}"></ng-container>
            </div>
            <div *ngIf="board.TRANSMITTED.length === 0" class="col-empty">No cases</div>
          </div>
        </div>

        <!-- PAYER_REVIEW -->
        <div class="kanban-col">
          <div class="col-header review">
            <span class="col-icon">🔍</span>
            <span class="col-title">Payer Review</span>
            <span class="col-count">{{ board.PAYER_REVIEW.length }}</span>
          </div>
          <div class="col-cards">
            <div *ngFor="let c of board.PAYER_REVIEW" class="kanban-card review-card" [routerLink]="['/case', c['caseId']]">
              <ng-container *ngTemplateOutlet="cardTpl; context:{c:c}"></ng-container>
            </div>
            <div *ngIf="board.PAYER_REVIEW.length === 0" class="col-empty">No cases</div>
          </div>
        </div>

        <!-- INFO_REQUESTED -->
        <div class="kanban-col">
          <div class="col-header info">
            <span class="col-icon">❓</span>
            <span class="col-title">Info Requested</span>
            <span class="col-count">{{ board.INFO_REQUESTED.length }}</span>
          </div>
          <div class="col-cards">
            <div *ngFor="let c of board.INFO_REQUESTED" class="kanban-card info-card" [routerLink]="['/case', c['caseId']]">
              <ng-container *ngTemplateOutlet="cardTpl; context:{c:c}"></ng-container>
            </div>
            <div *ngIf="board.INFO_REQUESTED.length === 0" class="col-empty">No cases</div>
          </div>
        </div>

        <!-- FINALIZED -->
        <div class="kanban-col">
          <div class="col-header finalized">
            <span class="col-icon">✅</span>
            <span class="col-title">Finalized</span>
            <span class="col-count">{{ board.FINALIZED.length }}</span>
          </div>
          <div class="col-cards">
            <div *ngFor="let c of board.FINALIZED" class="kanban-card finalized-card" [routerLink]="['/case', c['caseId']]">
              <ng-container *ngTemplateOutlet="cardTpl; context:{c:c}"></ng-container>
            </div>
            <div *ngIf="board.FINALIZED.length === 0" class="col-empty">No cases</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Template -->
    <ng-template #cardTpl let-c="c">
      <div class="card-top">
        <code class="card-case-id">{{ c['caseId'] }}</code>
        <span class="risk-badge" [class]="c['aiRiskLevel']">{{ c['aiRiskScore'] }}%</span>
      </div>
      <div class="card-patient">{{ c['patientName'] }}</div>
      <div class="card-codes">
        <span class="code-chip">{{ c['icd10Code'] }}</span>
        <span class="code-chip">{{ c['cptCode'] }}</span>
      </div>
      <div class="card-provider">{{ c['providerName'] }}</div>
      <div class="card-date">{{ formatDate(c['updatedAt']) }}</div>
    </ng-template>
  `,
  styles: [`
    .kanban-wrap { min-height: 100%; }
    .kanban-header { margin-bottom: 20px;
      h2 { margin: 0 0 4px; font-size: 18px; }
      .sub { margin: 0; color: var(--text-muted); font-size: 12px; }
    }
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 40px; color: var(--text-muted); }

    .kanban-board {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      align-items: start;
      overflow-x: auto;
      min-height: 500px;
    }

    .kanban-col { display: flex; flex-direction: column; gap: 10px; min-width: 200px; }

    .col-header {
      display: flex; align-items: center; gap: 8px; padding: 10px 12px;
      border-radius: var(--radius-md); font-size: 13px; font-weight: 600;
      .col-icon { font-size: 14px; }
      .col-title { flex: 1; }
      .col-count { background: rgba(255,255,255,0.1); padding: 1px 8px; border-radius: 10px; font-size: 11px; }
      &.draft       { background: rgba(139,148,158,0.12); color: var(--status-draft); }
      &.transmitted { background: rgba(88,166,255,0.12);  color: var(--status-transmitted); }
      &.review      { background: rgba(210,153,34,0.12);  color: var(--status-review); }
      &.info        { background: rgba(188,140,255,0.12); color: var(--status-info); }
      &.finalized   { background: rgba(63,185,80,0.12);   color: var(--status-finalized); }
    }

    .col-cards { display: flex; flex-direction: column; gap: 8px; }
    .col-empty { text-align: center; padding: 24px 8px; color: var(--text-muted); font-size: 12px;
      background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px dashed var(--border-color);
    }

    .kanban-card {
      background: var(--bg-card); border-radius: var(--radius-md);
      padding: 12px; cursor: pointer; transition: all 0.15s;
      text-decoration: none; display: block;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); text-decoration: none; }

      &.draft-card       { border-left: 3px solid var(--status-draft); }
      &.transmitted-card { border-left: 3px solid var(--status-transmitted); }
      &.review-card      { border-left: 3px solid var(--status-review); }
      &.info-card        { border-left: 3px solid var(--status-info); }
      &.finalized-card   { border-left: 3px solid var(--status-finalized); }
    }

    .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .card-case-id { font-size: 11px; color: var(--accent-blue); }
    .card-patient { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
    .card-codes { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
    .code-chip { font-size: 10px; background: var(--bg-tertiary); border-radius: 4px; padding: 2px 6px; color: var(--text-muted); font-family: monospace; }
    .card-provider { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .card-date { font-size: 10px; color: var(--text-muted); }
  `]
})
export class StatusTrackingComponent implements OnInit {
  board: KanbanBoard | null = null;
  loading = true;

  constructor(private authorizationService: AuthorizationService) {}

  ngOnInit(): void {
    this.authorizationService.getKanban().subscribe({
      next: b => { this.board = b; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  formatDate(ts: string): string {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString();
  }
}
