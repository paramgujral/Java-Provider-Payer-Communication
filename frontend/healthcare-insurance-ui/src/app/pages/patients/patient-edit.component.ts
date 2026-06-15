import { Component } from '@angular/core';
import { PatientFormComponent } from './patient-form.component';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: [PatientFormComponent],
  template: `<app-patient-form></app-patient-form>`
})
export class PatientEditComponent {}
