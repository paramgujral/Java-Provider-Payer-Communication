import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  template: `
  <div class="container">
    <div class="card">
      <h2>Notification Service</h2>
      <div class="ok" *ngIf="msg">{{msg}}</div><div class="error" *ngIf="err">{{err}}</div>
      <form [formGroup]="form" (ngSubmit)="send()">
        <div class="grid">
          <input type="number" formControlName="authorizationId" placeholder="Authorization ID">
          <input formControlName="receiverEmail" placeholder="Receiver Email">
          <input formControlName="subject" placeholder="Subject">
          <textarea formControlName="message" placeholder="Message"></textarea>
        </div><br><button [disabled]="form.invalid">Send Notification</button>
      </form>
    </div>
    <div class="card">
      <h3>Notifications</h3>
      <table class="table"><tr><th>ID</th><th>Auth ID</th><th>Email</th><th>Subject</th><th>Status</th></tr>
      <tr *ngFor="let n of rows"><td>{{n.id}}</td><td>{{n.authorizationId}}</td><td>{{n.receiverEmail}}</td><td>{{n.subject}}</td><td><span class="badge">{{n.status}}</span></td></tr></table>
    </div>
  </div>`
})
export class NotificationComponent implements OnInit {
  rows:any[]=[]; msg=''; err='';
  form=this.fb.group({authorizationId:[1,Validators.required],receiverEmail:['',Validators.required],subject:['',Validators.required],message:['',Validators.required]});
  constructor(private fb:FormBuilder, private api:ApiService){}
  ngOnInit(){this.load();}
  load() {
  this.api.notifications().subscribe({
    next: (d: any) => {
      this.rows = d;
    },
    error: () => {
      this.err = 'Failed to load notifications';
    }
  });
}
  send(){this.api.sendNotification(this.form.value).subscribe({next:()=>{this.msg='Notification sent';this.form.reset({authorizationId:1});this.load();},error:()=>this.err='Send failed'});}
}
