import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { NotificationBellComponent } from './notification.bell';
import { NotificationCenterService } from '../notification.service';
import { WebSocketService } from '../websocket.service';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationBellComponent],
      providers: [
        {
          provide: NotificationCenterService,
          useValue: {
            getMyNotifications: () => ({ subscribe: () => undefined }),
            markAllRead: () => ({ subscribe: () => undefined })
          }
        },
        {
          provide: WebSocketService,
          useValue: {
            notification$: { subscribe: () => ({ unsubscribe: () => undefined }) },
            connect: () => undefined,
            resetUnreadCount: () => undefined
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
