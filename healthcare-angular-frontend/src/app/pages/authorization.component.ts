import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  template: `
  <div class="container">
    <div class="card">
      <h2>Authorization Service</h2>
      <div class="ok" *ngIf="msg">{{msg}}</div><div class="error" *ngIf="err">{{err}}</div>
      <form *ngIf="canCreate()" [formGroup]="form" (ngSubmit)="create()">
        <div class="grid">
          <input type="number" formControlName="providerId" placeholder="Provider ID">
          <input type="number" formControlName="payerId" placeholder="Payer ID">
          <input formControlName="patientId" placeholder="Patient ID">
          <input formControlName="procedureCode" placeholder="Procedure Code">
          <input formControlName="diagnosisCode" placeholder="Diagnosis Code">
          <textarea formControlName="clinicalNotes" placeholder="Clinical Notes"></textarea>
        </div><br><button [disabled]="form.invalid">Create Authorization</button>
      </form>
      <br>
      <input [formControl]="remarks" placeholder="Payer remarks">
    </div>
    <div class="card">
      <h3>Requests</h3>
      <table class="table"><tr><th>ID</th><th>Provider</th><th>Payer</th><th>Patient</th><th>Status</th><th>Remarks</th><th>Actions</th></tr>
      <tr *ngFor="let r of rows">
        <td>{{r.id}}</td><td>{{r.providerId}}</td><td>{{r.payerId}}</td><td>{{r.patientId}}</td><td><span class="badge">{{r.status}}</span></td><td>{{r.payerRemarks}}</td>
        <td>
          <button *ngIf="canCreate()" class="warning" (click)="submit(r.id)">Submit</button>
          <button *ngIf="canDecide()" class="success" (click)="approve(r.id)">Approve</button>
          <button *ngIf="canDecide()" class="danger" (click)="reject(r.id)">Reject</button>
        </td>
      </tr></table>
    </div>
  </div>`
})
export class AuthorizationComponent implements OnInit {
  rows:any[]=[]; msg=''; err=''; remarks=this.fb.control('Approved after clinical review.');
  form=this.fb.group({providerId:[1,Validators.required],payerId:[1,Validators.required],patientId:['',Validators.required],procedureCode:['',Validators.required],diagnosisCode:['',Validators.required],clinicalNotes:['',Validators.required]});
  constructor(private fb:FormBuilder, private api:ApiService, private auth:AuthService){}
  ngOnInit(){this.load();}
  canCreate(){return ['ROLE_PROVIDER','ROLE_ADMIN'].includes(this.auth.role()||'');}
  canDecide(){return ['ROLE_PAYER','ROLE_ADMIN'].includes(this.auth.role()||'');}
  load() {
  this.api.authorizations().subscribe({
    next: (d: any) => {
      this.rows = d;
    },
    error: () => {
      this.err = 'Failed to load';
    }
  });
}
  create(){this.api.createAuthorization(this.form.value).subscribe({next:()=>{this.msg='Created';this.form.reset({providerId:1,payerId:1});this.load();},error:()=>this.err='Create failed'});}
  submit(id:number){this.api.submitAuth(id).subscribe({next:()=>{this.msg='Submitted';this.load();},error:()=>this.err='Submit failed'});}
  approve(id:number){this.api.approveAuth(id,this.remarks.value||'Approved').subscribe({next:()=>{this.msg='Approved';this.load();},error:()=>this.err='Approve failed'});}
  reject(id:number){this.api.rejectAuth(id,this.remarks.value||'Rejected').subscribe({next:()=>{this.msg='Rejected';this.load();},error:()=>this.err='Reject failed'});}
}
