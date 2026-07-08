import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayerList } from './payer-list';

describe('PayerList', () => {
  let component: PayerList;
  let fixture: ComponentFixture<PayerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayerList],
    }).compileComponents();

    fixture = TestBed.createComponent(PayerList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
