import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';

function getRedirectUri() {
  return (typeof window !== 'undefined') ? window.location.origin : 'http://localhost:4200';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    
    // Auth0 Interceptor konfigurieren
    provideAuth0({
      domain: 'dev-6jjybpjc1o3rkh2v.eu.auth0.com',
      clientId: 'FzBKiMdqMe4scsudf5EvTq7rHlrTrxSP',
      authorizationParams: {
        redirect_uri: getRedirectUri(),
        audience: 'https://tech-radar.api', // muss in Auth0 API so heißen
      },
      httpInterceptor: {
        allowedList: [{ uri: 'http://localhost:3000/api/*' }]
      }
    })
  ]
};
