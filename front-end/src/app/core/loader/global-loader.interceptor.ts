import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GlobalLoaderService } from './global-loader.service';

export const SKIP_GLOBAL_LOADER = 'X-Skip-Loader';

@Injectable()
export class GlobalLoaderInterceptor implements HttpInterceptor {
  constructor(private globalLoaderService: GlobalLoaderService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const skipLoader = this.shouldSkipLoader(req);
    const request = skipLoader
      ? req.clone({ headers: req.headers.delete(SKIP_GLOBAL_LOADER) })
      : req;

    if (!skipLoader) {
      this.globalLoaderService.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!skipLoader) {
          this.globalLoaderService.hide();
        }
      })
    );
  }

  private shouldSkipLoader(req: HttpRequest<unknown>): boolean {
    if (req.headers.has(SKIP_GLOBAL_LOADER)) {
      return true;
    }

    // Background / field-hint calls — never flash the global loader
    const url = req.url || '';
    if (req.method === 'GET' && url.includes('/Communication')) {
      return true;
    }
    if (url.includes('/$suggest') || url.includes('/$ai-review')) {
      return true;
    }

    return false;
  }
}
