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
      <h2>Payer Service</h2>
      <p>Admin creates payer records.</p>
      <div class="ok" *ngIf="msg">{{ msg }}</div><div class="error" *ngIf="err">{{ err }}</div>
      <form *ngIf="isAdmin()" [formGroup]="form" (ngSubmit)="save()">
        <div class="grid">
          <input formControlName="payerName" placeholder="Payer Name">
          <input formControlName="payerCode" placeholder="Payer Code">
          <input formControlName="email" placeholder="Email">
          <input formControlName="phone" placeholder="Phone">
        </div><br>
        <button [disabled]="form.invalid">{{ editId ? 'Update' : 'Create' }}</button>
        <button type="button" class="secondary" (click)="cancel()">Cancel</button>
      </form>
      <span *ngIf="!isAdmin()" class="badge">Read only for this role</span>
    </div>
    <div class="card">
      <h3>Payers</h3>
      <table class="table"><tr><th>ID</th><th>Name</th><th>Code</th><th>Email</th><th>Phone</th><th *ngIf="isAdmin()">Action</th></tr>
      <tr *ngFor="let p of payers">
        <td>{{p.id}}</td><td>{{p.payerName}}</td><td>{{p.payerCode}}</td><td>{{p.email}}</td><td>{{p.phone}}</td>
        <td *ngIf="isAdmin()"><button (click)="edit(p)">Edit</button><button class="danger" (click)="remove(p.id)">Delete</button></td>
      </tr></table>
    </div>
  </div>`
})
export class PayerComponent implements OnInit {
  payers:any[]=[]; editId:number|null=null; msg=''; err='';
  form=this.fb.group({payerName:['',Validators.required],payerCode:['',Validators.required],email:[''],phone:['']});
  constructor(private fb:FormBuilder, private api:ApiService, private auth:AuthService){}
  ngOnInit(){this.load();}
  isAdmin(){return this.auth.role()==='ROLE_ADMIN';}
  load() {
  this.api.payers().subscribe({
    next: (d: any) => {
      this.payers = d;
    },
    error: () => {
      this.err = 'Failed to load payers';
    }
  });
}
  save(){const op=this.editId?this.api.updatePayer(this.editId,this.form.value):this.api.createPayer(this.form.value);op.subscribe({next:()=>{this.msg='Saved';this.cancel();this.load();},error:()=>this.err='Save failed'});}
  edit(p:any){this.editId=p.id;this.form.patchValue(p);}
  remove(id:number){this.api.deletePayer(id).subscribe({next:()=>{this.msg='Deleted';this.load();},error:()=>this.err='Delete failed'});}
  cancel(){this.editId=null;this.form.reset();}
}
