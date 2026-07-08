import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiReviewModalComponent } from './ai-review-modal-component';

describe('AiReviewModalComponent', () => {
  let component: AiReviewModalComponent;
  let fixture: ComponentFixture<AiReviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiReviewModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiReviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
