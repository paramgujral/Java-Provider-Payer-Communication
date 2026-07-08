import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAuthorization } from './create-authorization';

describe('CreateAuthorization', () => {
  let component: CreateAuthorization;
  let fixture: ComponentFixture<CreateAuthorization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAuthorization],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAuthorization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
