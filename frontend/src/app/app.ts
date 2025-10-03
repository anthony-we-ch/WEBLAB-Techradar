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
    this.api.secureMe().subscribe((r) => (this.secureResp = r));
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
}
