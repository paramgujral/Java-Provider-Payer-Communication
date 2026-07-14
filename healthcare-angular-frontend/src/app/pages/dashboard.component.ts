import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="container">
    <div class="card hero">
      <h1>Smart Healthcare Connector</h1>
      <p>AI-assisted payer-provider authorization workflow platform.</p>
      <p><b>User:</b> {{ auth.username() }} | <b>Role:</b> {{ auth.role() }}</p>
    </div>
    <div class="tiles">
      <a class="tile" routerLink="/providers"><h3>Provider Service</h3><p>Manage provider master data.</p></a>
      <a class="tile" routerLink="/payers"><h3>Payer Service</h3><p>Manage payer master data.</p></a>
      <a class="tile" routerLink="/authorizations"><h3>Authorization Service</h3><p>Create, submit, approve, reject requests.</p></a>
      <a class="tile" routerLink="/ai-review"><h3>AI Copilot</h3><p>Validate request before submission.</p></a>
      <a class="tile" routerLink="/notifications"><h3>Notifications</h3><p>Send status notifications.</p></a>
    </div>
  </div>`
})
export class DashboardComponent { constructor(public auth: AuthService) {} }
