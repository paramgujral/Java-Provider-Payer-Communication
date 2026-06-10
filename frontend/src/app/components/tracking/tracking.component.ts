import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthorizationRequest } from '../../models/models';
import { FhirViewerComponent } from '../fhir-viewer/fhir-viewer.component';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FhirViewerComponent],
  template: `
    <!-- Summary stats -->
    <div class="stat-grid">
      <div class="stat"><div class="v">{{ requests.length }}</div><div class="l">Total</div></div>
      <div class="stat"><div class="v" style="color:var(--amber)">{{ count('PENDING_REVIEW') + count('INFO_REQUESTED') }}</div><div class="l">In progress</div></div>
      <div class="stat"><div class="v" style="color:var(--green)">{{ count('APPROVED') }}</div><div class="l">Approved</div></div>
      <div class="stat"><div class="v" style="color:var(--coral)">{{ count('DENIED') }}</div><div class="l">Denied</div></div>
    </div>

    <div class="grid-2">
      <!-- Request list -->
      <div class="card" style="align-self:start">
        <div class="card-head"><h3>All Requests</h3></div>
        <div class="req-row" *ngFor="let r of requests" (click)="open(r)"
             [style.background]="selected?.id === r.id ? 'var(--paper)' : ''">
          <span class="status" [ngClass]="'st-' + r.status"></span>
          <div>
            <div class="pat">{{ r.patientName }}</div>
            <div class="svc">{{ r.payerName }} · {{ r.serviceLines[0]?.cptCode }}</div>
          </div>
          <div style="text-align:right">
            <div class="ref">{{ r.reference }}</div>
            <div class="svc">{{ r.updatedAt | date:'MMM d, HH:mm' }}</div>
          </div>
          <span class="status" [ngClass]="'st-' + r.status">{{ r.status }}</span>
        </div>
      </div>

      <!-- Detail: timeline + FHIR -->
      <div>
        <div *ngIf="!selected" class="card card-pad empty">
          <div class="big">⏱ Status &amp; history</div>
          Select a request to trace its full lifecycle and inspect the exchanged
          FHIR resources.
        </div>

        <div *ngIf="selected" class="card" style="margin-bottom:20px">
          <div class="card-head">
            <h3>{{ selected.reference }}</h3>
            <span class="status" [ngClass]="'st-' + selected.status">{{ selected.status }}</span>
          </div>
          <div class="card-pad">
            <div *ngIf="selected.decision" class="tag-line" style="margin-bottom:14px">
              <span class="chip" style="background:var(--ink);color:#fff">{{ selected.decision }}</span>
              <span *ngIf="selected.authorizationNumber" class="chip chip-mono" style="background:var(--green-soft);color:var(--green)">{{ selected.authorizationNumber }}</span>
              <span class="muted">{{ selected.decisionRationale }}</span>
            </div>
            <p class="section-label">Lifecycle</p>
            <div class="timeline">
              <div class="tl-item" *ngFor="let e of selected.history">
                <div class="when">{{ e.createdAt | date:'MMM d, y · HH:mm' }}</div>
                <div class="what">{{ e.status.replace('_', ' ') }} <span *ngIf="e.note" class="muted">— {{ e.note }}</span></div>
                <div class="who">{{ e.actor }}</div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="selected && bundle" class="card">
          <app-fhir-viewer [data]="bundle"></app-fhir-viewer>
        </div>
      </div>
    </div>
  `
})
export class TrackingComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  selected: AuthorizationRequest | null = null;
  bundle: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.allRequests().subscribe((r) => (this.requests = r));
  }

  count(status: string) { return this.requests.filter((r) => r.status === status).length; }

  open(r: AuthorizationRequest) {
    this.bundle = null;
    if (!r.id) return;
    this.api.getRequest(r.id).subscribe((full) => (this.selected = full));
    this.api.fhirBundle(r.id).subscribe((b) => (this.bundle = b));
  }
}
