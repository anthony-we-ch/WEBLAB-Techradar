import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { ApiService, RadarItem } from '../../core/api.service';

@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.scss'],
})
export class RadarComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  public auth = inject(AuthService, { optional: true });

  items: RadarItem[] = [];
  isAuth$ = this.auth?.isAuthenticated$ ?? of(false);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: ['assess' as RadarItem['status'], Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.api.listRadar().subscribe((items) => (this.items = items));
  }

  create() {
    if (this.form.invalid) return;
    const body = this.form.getRawValue();
    this.api.createRadar(body).subscribe({
      next: (created) => {
        this.items = [created, ...this.items];
        this.form.reset({ title: '', description: '', status: 'assess' });
      },
      error: (err) => {
        console.error(err);
        alert('Speichern fehlgeschlagen (bist du eingeloggt?)');
      },
    });
  }
}
