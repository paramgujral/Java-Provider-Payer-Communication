export type NotificationType = 'SUBMISSION' | 'APPROVAL' | 'REJECTION' | 'INFO_REQUEST' | 'RESUBMISSION';

export interface Notification {
  id: number;
  userId: number;
  requestId?: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
