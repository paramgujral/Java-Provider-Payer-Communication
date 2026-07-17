import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  summary: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('/api/admin/dashboard').subscribe({
      next: (response) => {
        this.summary = response.data;
      }
    });
  }
}
