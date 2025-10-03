import { CommonModule, DatePipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@auth0/auth0-angular";
import { of } from "rxjs";
import { ApiService, RadarItem, RadarQuadrant, RadarStatus } from "../../core/api.service";

@Component({
  selector: "app-radar",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: "./radar.component.html",
  styleUrls: ["./radar.component.scss"],
})
export class RadarComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  public auth = inject(AuthService, { optional: true });

  private readonly statusOrder: RadarStatus[] = ["adopt", "trial", "assess", "hold"];
  private readonly quadrantOrder: RadarQuadrant[] = [
    "languages-frameworks", "techniques", "tools", "platforms"
  ];

  readonly quadrantLabel: Record<RadarQuadrant, string> = {
    'languages-frameworks': 'Languages & Frameworks',
    'techniques': 'Techniques',
    'tools': 'Tools',
    'platforms': 'Platforms'
  };

  items: RadarItem[] = [];
  isAuth$ = this.auth?.isAuthenticated$ ?? of(false);

  form = this.fb.nonNullable.group({
    title: ["", [Validators.required, Validators.minLength(3)]],
    private: [false],
    status: ["assess" as RadarStatus, Validators.required],
    quadrant: ["languages-frameworks" as RadarQuadrant, Validators.required],
    reason: ["", [Validators.required, Validators.minLength(5)]],
    description: ["", [Validators.required, Validators.minLength(5)]],
  });

  get sortedItems(): RadarItem[] {
    const statusIdx = (s: RadarStatus) => this.statusOrder.indexOf(s);
    const quadIdx = (q: RadarQuadrant) => this.quadrantOrder.indexOf(q);

    return [...this.items].sort((a, b) => {
      const s = statusIdx(a.status) - statusIdx(b.status);
      if (s !== 0) return s;
      const q = quadIdx(a.quadrant) - quadIdx(b.quadrant);
      if (q !== 0) return q;
      return a.title.localeCompare(b.title);
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.api.listRadar().subscribe((items) => (this.items = items));
  }

  create() {
    if (this.form.invalid) return;
    const body = this.form.getRawValue() as RadarItem;
    this.api.createRadar(body).subscribe({
      next: (created) => {
        this.items = [created, ...this.items];
        this.form.reset({
          title: "",
          private: false,
          status: "assess",
          quadrant: "languages-frameworks",
          reason: "",
          description: "",          
        });
      },
      error: (err) => {
        console.error(err);
        alert("Speichern/Validierung fehlgeschlagen");
      },
    });
  }
}
