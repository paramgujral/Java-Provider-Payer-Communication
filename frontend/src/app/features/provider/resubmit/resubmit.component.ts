import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { AuthorizationRequest } from '../../../core/models/models';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';

@Component({
  selector: 'app-resubmit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './resubmit.component.html',
  styleUrls: ['./resubmit.component.scss']
})
export class ResubmitComponent implements OnInit {
  request  = signal<AuthorizationRequest | null>(null);
  loading  = signal(true);
  saving   = signal(false);
  error    = signal('');
  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestSvc: RequestService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.requestSvc.getRequestById(id).subscribe({
      next: req => {
        this.request.set(req);
        this.loading.set(false);
        this.form = this.fb.group({
          clinicalNotes:        [req.clinicalNotes || ''],
          supportingDocuments:  [req.supportingDocuments || ''],
          additionalInfo:       [''],
          facilityName:         [req.facilityName || ''],
          treatingPhysician:    [req.treatingPhysician || ''],
          diagnosisCode:        [req.diagnosisCode],
          diagnosisDescription: [req.diagnosisDescription],
          procedureCode:        [req.procedureCode],
          procedureDescription: [req.procedureDescription]
        });
      },
      error: () => { this.loading.set(false); this.error.set('Request not found.'); }
    });
  }

  submit(): void {
    this.saving.set(true);
    this.error.set('');
    this.requestSvc.resubmitRequest(this.request()!.id, this.form.value).subscribe({
      next: () => this.router.navigate(['/provider/requests'],
        { queryParams: { submitted: 'true' } }),
      error: err => {
        this.error.set(err.error?.error || 'Failed to resubmit.');
        this.saving.set(false);
      }
    });
  }
}
