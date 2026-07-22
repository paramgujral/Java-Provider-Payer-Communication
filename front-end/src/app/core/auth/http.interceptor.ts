import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SessionAuthService } from '../../features/auth/auth.service';

@Injectable()
export class JwtAuthInterceptor implements HttpInterceptor {
  private redirectingToLogin = false;

  constructor(
    private sessionAuthService: SessionAuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.sessionAuthService.getToken();
    const isFhirApi = req.url.includes('/fhir');

    let headers = req.headers;
    if (isFhirApi) {
      if (!headers.has('Content-Type') && !(req.body instanceof FormData)) {
        headers = headers.set('Content-Type', 'application/fhir+json');
      }
      if (!headers.has('Accept')) {
        headers = headers.set('Accept', 'application/fhir+json');
      }
    }

    // Never attach a stale token to login/register — it can block auth with 401/403
    if (token && !this.isPublicAuthCall(req.url)) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const authReq = req.clone({ headers });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isPublicAuthCall(req.url)) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  private isPublicAuthCall(url: string): boolean {
    return url.includes('/fhir/login')
        || url.includes('/fhir/$login')
        || url.includes('/fhir/Practitioner');
  }

  private handleUnauthorized(): void {
    if (this.redirectingToLogin) {
      return;
    }
    this.redirectingToLogin = true;
    this.sessionAuthService.clearSession();
    this.router.navigate(['/login']).then(() => {
      this.redirectingToLogin = false;
    });
  }
}
