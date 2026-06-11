import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { JwtInterceptor } from './app/interceptors/jwt.interceptor';
import { SharedService } from './app/services/shared.service';
import { ProviderService } from './app/services/provider.service';
import { PayerService } from './app/services/payer.service';
import { ChatService } from './app/services/chat.service';
import { AuthGuard } from './app/guards/auth.guard';
import { RoleGuard } from './app/guards/role.guard';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    provideRouter(routes),

    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },

    SharedService,
    ProviderService,
    PayerService,
    ChatService,
    AuthGuard,
    RoleGuard
  ]
});