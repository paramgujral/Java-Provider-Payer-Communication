import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
  <div class="container">
    <div class="card">
      <h2>AI Copilot Review</h2>
      <div class="error" *ngIf="err">{{err}}</div>
      <form [formGroup]="form" (ngSubmit)="review()">
        <div class="grid">
          <input formControlName="authorizationId" placeholder="Authorization ID">
          <input formControlName="patientId" placeholder="Patient ID">
          <input formControlName="payerId" placeholder="Payer ID">
          <input formControlName="procedureCode" placeholder="Procedure Code">
          <input formControlName="diagnosisCode" placeholder="Diagnosis Code">
          <textarea formControlName="clinicalNotes" placeholder="Clinical Notes"></textarea>
        </div><br><button [disabled]="form.invalid">Run AI Review</button>
      </form>
    </div>
    <div class="card" *ngIf="result">
      <h3>Result</h3>
      <p><b>Valid:</b> {{result.validRequest}}</p>
      <p><b>Recommendations:</b> {{result.recommendations}}</p>
    </div>
  </div>`
})
export class AiReviewComponent {
  result:any; err='';
  form=this.fb.group({authorizationId:['1',Validators.required],patientId:['',Validators.required],payerId:['1',Validators.required],procedureCode:['',Validators.required],diagnosisCode:['',Validators.required],clinicalNotes:['',Validators.required]});
  constructor(private fb:FormBuilder, private api:ApiService){}
  review() {
  this.api.aiReview(this.form.value).subscribe({
    next: (d: any) => {
      this.result = d;
      this.err = '';
    },
    error: () => {
      this.err = 'AI review failed';
    }
  });
}}
