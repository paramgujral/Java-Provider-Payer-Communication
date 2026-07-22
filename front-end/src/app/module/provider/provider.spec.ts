import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ProviderPortalComponent } from './provider';
import { ProviderRequestsService } from './provider.service';

describe('ProviderPortalComponent', () => {
  let component: ProviderPortalComponent;
  let fixture: ComponentFixture<ProviderPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProviderPortalComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: ProviderRequestsService,
          useValue: {
            getMyRequests: () => ({ subscribe: () => undefined }),
            submitRequest: () => ({ subscribe: () => undefined }),
            getFieldSuggestion: () => ({ subscribe: () => undefined })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
