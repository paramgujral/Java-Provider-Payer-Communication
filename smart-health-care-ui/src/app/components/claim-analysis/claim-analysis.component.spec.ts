import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimAnalysisComponent } from './claim-analysis.component';

describe('ClaimAnalysisComponent', () => {
  let component: ClaimAnalysisComponent;
  let fixture: ComponentFixture<ClaimAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
