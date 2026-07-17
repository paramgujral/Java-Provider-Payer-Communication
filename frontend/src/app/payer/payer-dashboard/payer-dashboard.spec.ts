import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayerDashboard } from './payer-dashboard';

describe('PayerDashboard', () => {
  let component: PayerDashboard;
  let fixture: ComponentFixture<PayerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(PayerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the login page when logout is called', () => {
    component.logout();

    expect(window.location.href).toBe('/');
  });
});
