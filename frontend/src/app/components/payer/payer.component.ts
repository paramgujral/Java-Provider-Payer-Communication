import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthorizationRequest, DecisionDto } from '../../models/models';
import { FhirViewerComponent } from '../fhir-viewer/fhir-viewer.component';

@Component({
  selector: 'app-payer',
  standalone: true,
  imports: [CommonModule, FormsModule, FhirViewerComponent],
  template: `
    <div class="grid-2">
      <!-- Queue -->
      <div class="card" style="align-self:start">
        <div class="card-head">
          <h3>Review Queue</h3>
          <span class="chip" style="background:var(--amber-soft);color:var(--amber)">{{ queue.length }} pending</span>
        </div>
        <div *ngIf="queue.length === 0" class="empty">
          <div class="big">Queue clear</div>No requests awaiting review.
        </div>
        <div class="req-row" *ngFor="let r of queue" (click)="open(r)"
             [style.background]="selected?.id === r.id ? 'var(--paper)' : ''">
          <span class="status" [ngClass]="'st-' + r.status"></span>
          <div>
            <div class="pat">{{ r.patientName }}</div>
            <div class="svc">{{ r.serviceLines[0]?.cptCode }} · {{ r.serviceLines[0]?.description }}</div>
          </div>
          <div style="text-align:right">
            <div class="ref">{{ r.reference }}</div>
            <div class="svc">{{ r.providerOrg }}</div>
          </div>
          <span class="chip" [style.background]="scoreBg(r.readinessScore)" [style.color]="scoreFg(r.readinessScore)">
            {{ r.readinessScore }}
          </span>
        </div>
      </div>

      <!-- Detail / decision -->
      <div>
        <div *ngIf="!selected" class="card card-pad empty">
          <div class="big">⚖ Adjudication</div>
          Select a request to review its clinical detail, the Copilot assessment,
          the FHIR Claim, and to record a decision.
        </div>

        <div *ngIf="selected" class="card" style="margin-bottom:20px">
          <div class="card-head">
            <h3>{{ selected.reference }}</h3>
            <span class="status" [ngClass]="'st-' + selected.status">{{ selected.status }}</span>
          </div>
          <div class="card-pad">
            <div class="kv"><span class="k">Patient</span><span>{{ selected.patientName }} · {{ selected.patientGender }} · {{ selected.patientBirthDate }}</span></div>
            <div class="kv"><span class="k">Coverage</span><span>{{ selected.payerName }} — {{ selected.planName }} ({{ selected.memberId }})</span></div>
            <div class="kv"><span class="k">Provider</span><span>{{ selected.providerName }}, {{ selected.providerOrg }}</span></div>
            <div class="kv"><span class="k">Diagnoses</span><span>
              <span *ngFor="let d of selected.diagnoses" class="chip chip-mono" style="background:var(--blue-soft);color:var(--blue);margin-right:5px">{{ d.icd10Code }}</span>
            </span></div>
            <div class="kv"><span class="k">Services</span><span>
              <span *ngFor="let s of selected.serviceLines" class="chip chip-mono" style="background:var(--green-soft);color:var(--green);margin-right:5px">{{ s.cptCode }} ×{{ s.units }}</span>
            </span></div>
            <div class="divider"></div>
            <p class="section-label">Clinical notes</p>
            <p style="white-space:pre-wrap;margin:0">{{ selected.clinicalNotes }}</p>

            <div *ngIf="selected.copilotReview" style="margin-top:16px">
              <p class="section-label">Copilot assessment ({{ selected.copilotReview.source }})</p>
              <div class="tag-line">
                <span class="chip" [style.background]="scoreBg(selected.readinessScore)" [style.color]="scoreFg(selected.readinessScore)">
                  Readiness {{ selected.copilotReview.readinessScore }}/100
                </span>
                <span class="muted">{{ selected.copilotReview.medicalNecessity }}</span>
              </div>
            </div>
          </div>

          <!-- Decision controls -->
          <div class="card-pad" style="background:var(--paper);border-top:1px solid var(--line)">
            <p class="section-label">Decision</p>
            <div class="field">
              <textarea [(ngModel)]="rationale" rows="2" placeholder="Rationale / note to provider…"></textarea>
            </div>
            <div class="row" *ngIf="action === 'APPROVED'">
              <div class="field"><label>Auth #</label><input [(ngModel)]="authNumber" placeholder="AUTH-0000000"></div>
              <div class="field"><label>Valid through</label><input type="date" [(ngModel)]="authValidTo"></div>
            </div>
            <div class="btn-row">
              <button class="btn btn-green" (click)="action='APPROVED'; decide('APPROVED')">Approve</button>
              <button class="btn btn-amber" (click)="decide('INFO_REQUESTED')">Request info</button>
              <button class="btn btn-coral" (click)="decide('DENIED')">Deny</button>
            </div>
          </div>
        </div>

        <div *ngIf="selected && bundle" class="card">
          <app-fhir-viewer [data]="bundle"></app-fhir-viewer>
        </div>
      </div>
    </div>

    <div class="toast" *ngIf="toast">{{ toast }}</div>
  `
})
export class PayerComponent implements OnInit {
  queue: AuthorizationRequest[] = [];
  selected: AuthorizationRequest | null = null;
  bundle: any = null;
  rationale = '';
  authNumber = '';
  authValidTo = '';
  action = '';
  toast = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() { this.api.payerQueue().subscribe((q) => (this.queue = q)); }

  open(r: AuthorizationRequest) {
    this.selected = r;
    this.bundle = null;
    this.rationale = ''; this.authNumber = ''; this.authValidTo = ''; this.action = '';
    if (r.id) this.api.fhirBundle(r.id).subscribe((b) => (this.bundle = b));
  }

  decide(decision: DecisionDto['decision']) {
    if (!this.selected?.id) return;
    const dto: DecisionDto = {
      decision,
      rationale: this.rationale,
      authorizationNumber: this.authNumber || undefined,
      authValidFrom: new Date().toISOString().slice(0, 10),
      authValidTo: this.authValidTo || undefined
    };
    this.api.decide(this.selected.id, dto).subscribe({
      next: (updated) => {
        this.flash(`${updated.reference}: ${decision.replace('_', ' ').toLowerCase()} — provider notified.`);
        this.selected = null; this.bundle = null;
        this.load();
      },
      error: () => this.flash('Decision failed — is the backend running?')
    });
  }

  scoreBg(s?: number) { return !s ? 'var(--paper-2)' : s >= 80 ? 'var(--green-soft)' : s >= 60 ? 'var(--amber-soft)' : 'var(--coral-soft)'; }
  scoreFg(s?: number) { return !s ? 'var(--ink-soft)' : s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--amber)' : 'var(--coral)'; }

  private flash(msg: string) { this.toast = msg; setTimeout(() => (this.toast = ''), 3600); }
}
