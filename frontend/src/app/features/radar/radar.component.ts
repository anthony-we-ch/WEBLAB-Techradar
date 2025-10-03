import { CommonModule, DatePipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { AuthService } from "@auth0/auth0-angular";
import { of } from "rxjs";
import type { UpdateTechnologyDto } from '../../core/api.service';
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
    this.api.listRadar().subscribe(items => {
      console.log('items', items);
      this.items = items;
    });
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

  // --- Einordnung-Editor ---

  editingClassId: string | null = null;
  formClass = this.fb.nonNullable.group({
    status: this.fb.nonNullable.control<'adopt'|'trial'|'assess'|'hold'>('assess', Validators.required),
    quadrant: this.fb.nonNullable.control<'languages-frameworks'|'techniques'|'tools'|'platforms'>('languages-frameworks', Validators.required),
    reason: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)])
  });

  private originalForEdit: { status: RadarStatus; quadrant: RadarQuadrant } | null = null;

  openEinordnungEditor(item: RadarItem) {
    if (!item.id) return;
    this.editingClassId = item.id;
    this.originalForEdit = { status: item.status, quadrant: item.quadrant };
    this.formClass.reset({
      status: item.status,
      quadrant: item.quadrant,
      reason: ''
    });
    this.formClass.setValidators(this.classificationChangedValidator());
    this.formClass.updateValueAndValidity();
  }

  cancelEinordnungEditor() {
    this.editingClassId = null;
    this.originalForEdit = null;
    this.formClass.reset();
    this.formClass.clearValidators();
  }

  private classificationChangedValidator() {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const val = ctrl.value as { status: RadarStatus; quadrant: RadarQuadrant; reason: string };
      if (!this.originalForEdit) return { invalid: true };
      const changed = val.status !== this.originalForEdit.status || val.quadrant !== this.originalForEdit.quadrant;
      const hasReason = !!val.reason && val.reason.trim().length >= 3;
      return changed && hasReason ? null : { notReady: true };
    };
  }

  confirmEinordnung(item: RadarItem) {
    if (!item.id || this.formClass.invalid) return;
    const { status, quadrant, reason } = this.formClass.getRawValue();
    this.api.updateClassification(item.id, { status, quadrant, reason }).subscribe({
      next: (updated) => {
        this.items = this.items.map(x => x.id === updated.id ? updated : x);
        this.cancelEinordnungEditor();
      },
      error: (err) => {
        console.error(err);
        alert('Änderung fehlgeschlagen.');
      }
    });
  }

  changeEinordnung(item: RadarItem) {
    this.openEinordnungEditor(item);
    console.log('Einordnung ändern:', item);
  }

  // --- Technologie-Editor ---
  editingTechId: string | null = null;

  formTech = this.fb.nonNullable.group({
    title: this.fb.nonNullable.control<string>('', [Validators.required, Validators.minLength(3)]),
    description: this.fb.nonNullable.control<string>(''),
    quadrant: this.fb.nonNullable.control<RadarQuadrant>('languages-frameworks', Validators.required),
  });

  private originalTechForEdit: { title: string; description: string; quadrant: RadarQuadrant } | null = null;

  openTechnologieEditor(item: RadarItem) {
    if (!item.id) return;
    this.editingTechId = item.id;
    this.originalTechForEdit = {
      title: item.title,
      description: item.description ?? '',
      quadrant: item.quadrant,
    };
    this.formTech.reset({
      title: item.title,
      description: item.description ?? '',
      quadrant: item.quadrant,
    });
    this.formTech.setValidators(this.technologyChangedValidator());
    this.formTech.updateValueAndValidity();
  }

  cancelTechnologieEditor() {
    this.editingTechId = null;
    this.originalTechForEdit = null;
    this.formTech.reset();
    this.formTech.clearValidators();
  }

  private technologyChangedValidator() {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const val = ctrl.value as { title: string; description: string; quadrant: RadarQuadrant };
      if (!this.originalTechForEdit) return { invalid: true };
      const changed =
        val.title !== this.originalTechForEdit.title ||
        val.description !== this.originalTechForEdit.description ||
        val.quadrant !== this.originalTechForEdit.quadrant;
      const titleOk = typeof val.title === 'string' && val.title.trim().length >= 3;
      return changed && titleOk ? null : { notReady: true };
    };
  }

  confirmTechnologie(item: RadarItem) {
    if (!item.id || this.formTech.invalid) return;
    const { title, description, quadrant } = this.formTech.getRawValue();

    // Nur geänderte Felder senden (optional, reduziert Payload)
    const payload: UpdateTechnologyDto = {};
    if (title !== this.originalTechForEdit?.title) payload.title = title;
    if (description !== this.originalTechForEdit?.description) payload.description = description ?? '';
    if (quadrant !== this.originalTechForEdit?.quadrant) payload.quadrant = quadrant;

    this.api.updateTechnology(item.id, payload).subscribe({
      next: (updated) => {
        this.items = this.items.map(x => x.id === updated.id ? updated : x);
        this.cancelTechnologieEditor();
      },
      error: (err) => {
        console.error(err);
        alert('Änderung fehlgeschlagen (Titel zu kurz? Quadrant ungültig? Token?).');
      }
    });
  }

  changeTechnologie(item: RadarItem) {
    this.openTechnologieEditor(item);
    console.log('Technologie ändern:', item);
  }

  // --- Sonstiges ---


  publishItem(item: RadarItem) {
    // TODO: später Backend-Call (private -> false)
    console.log('Publizieren:', item);
  }

  deleteItem(item: RadarItem) {
    if (!item.id) return;

    this.api.deleteRadar(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(x => x.id !== item.id);
      },
      error: (err) => {
        console.error(err);
        alert('Löschen fehlgeschlagen');
      }
    });
  }

  trackById(_index: number, it: RadarItem) {
    return it.id ?? it.title;
  }
}
