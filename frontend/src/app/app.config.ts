import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthHttpInterceptor, provideAuth0 } from '@auth0/auth0-angular';

function getRedirectUri() {
  return (typeof window !== 'undefined') ? window.location.origin : 'http://localhost:4200';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
    
    // Auth0 Interceptor konfigurieren
    provideAuth0({
      domain: 'dev-6jjybpjc1o3rkh2v.eu.auth0.com',
      clientId: 'FzBKiMdqMe4scsudf5EvTq7rHlrTrxSP',
      authorizationParams: {
        redirect_uri: getRedirectUri(),
        audience: 'https://tech-radar.api',
        scope: 'openid profile email'
      },
      httpInterceptor: {
        allowedList: [
          { uri: 'http://localhost:3000/api/*', httpMethod: 'GET' },
          { uri: 'http://localhost:3000/api/*', httpMethod: 'POST' },
          { uri: 'http://localhost:3000/api/*', httpMethod: 'PUT' },
          { uri: 'http://localhost:3000/api/*', httpMethod: 'DELETE' },
          { uri: 'http://localhost:3000/api/*', httpMethod: 'PATCH' },
        ]
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    })
  ]
};
