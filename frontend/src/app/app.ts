import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { ApiService } from './core/api.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  private api = inject(ApiService);
  public auth = inject(AuthService, { optional: true});

  resp: any;
  secureResp: any;

  user$ = this.auth?.user$ ?? of(null);
  isAuth$ = this.auth?.isAuthenticated$ ?? of(false);

  check() {
    this.api.health().subscribe(r => this.resp = r);
  }

  checkSecure() {
    this.api.secureMe().subscribe(r => this.secureResp = r);
  }

  login() {
    this.auth?.loginWithRedirect();
  }

  logout() {
    this.auth?.logout({ logoutParams: { returnTo: (typeof window !== 'undefined' ? window.location.origin : '/') } });
  }
}
