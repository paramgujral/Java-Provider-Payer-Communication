import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderList } from './provider-list';

describe('ProviderList', () => {
  let component: ProviderList;
  let fixture: ComponentFixture<ProviderList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
