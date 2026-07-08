import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  username: string | null = '';

  constructor(
    public router: Router
  ) {
   if (typeof window !== 'undefined') {
  this.username = localStorage.getItem('username');
}
  }

  logout(): void {

  if (typeof window !== 'undefined') {

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

  }

  this.router.navigate(['/login']);
}
}