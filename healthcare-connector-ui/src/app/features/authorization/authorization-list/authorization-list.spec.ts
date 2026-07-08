import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationList } from './authorization-list';

describe('AuthorizationList', () => {
  let component: AuthorizationList;
  let fixture: ComponentFixture<AuthorizationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationList],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
