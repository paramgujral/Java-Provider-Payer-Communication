import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FhirExportComponent } from './fhir-export.component';

describe('FhirExportComponent', () => {
  let component: FhirExportComponent;
  let fixture: ComponentFixture<FhirExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FhirExportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FhirExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
