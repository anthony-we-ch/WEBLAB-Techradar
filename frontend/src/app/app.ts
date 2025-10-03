import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { ApiService, HealthResponse, SecureMeResponse } from './core/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  private api = inject(ApiService);
  public auth = inject(AuthService, { optional: true });

  resp?: HealthResponse;
  secureResp?: SecureMeResponse;

  user$ = this.auth?.user$ ?? of(null);
  isAuth$ = this.auth?.isAuthenticated$ ?? of(false);

  check() {
    this.api.health().subscribe((r) => (this.resp = r));
  }

  checkSecure() {
    this.auth?.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) { alert('Bitte erst einloggen'); return; }
      this.api.secureMe().subscribe({
        next: r => this.secureResp = r,
        error: e => console.error('secure err', e)
      });
    });
  }

  getToken() {
    this.auth?.getAccessTokenSilently().subscribe(t => {
      console.log('ACCESS TOKEN:', t);
      alert(t ? 'Token in Konsole geloggt' : 'Kein Token');
    });
  }

  login() {
    this.auth?.loginWithRedirect();
  }

  logout() {
    this.auth?.logout({
      logoutParams: {
        returnTo: typeof window !== 'undefined' ? window.location.origin : '/',
      },
    });
  }

  debugHeaders() {
    this.api.debugHeaders().subscribe(console.log, console.error);
  }
}
