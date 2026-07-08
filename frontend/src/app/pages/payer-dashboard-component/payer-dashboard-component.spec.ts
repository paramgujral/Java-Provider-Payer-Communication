import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayerDashboardComponent } from './payer-dashboard-component';

describe('PayerDashboardComponent', () => {
  let component: PayerDashboardComponent;
  let fixture: ComponentFixture<PayerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
