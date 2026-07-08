import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProvider } from './create-provider';

describe('CreateProvider', () => {
  let component: CreateProvider;
  let fixture: ComponentFixture<CreateProvider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProvider],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProvider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
