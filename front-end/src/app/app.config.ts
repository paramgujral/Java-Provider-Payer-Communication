import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideHighcharts } from 'highcharts-angular';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),                        // ← fixes XHR deprecated warning
      withInterceptors([jwtInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    provideHighcharts({
      instance: () => import('highcharts')
    })
  ]
};
