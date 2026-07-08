import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePayer } from './create-payer';

describe('CreatePayer', () => {
  let component: CreatePayer;
  let fixture: ComponentFixture<CreatePayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePayer],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
