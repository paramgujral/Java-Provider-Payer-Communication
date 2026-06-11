export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  relatedId?: string;
}

export enum NotificationType {
  NEW_REQUEST = 'New Request',
  APPROVAL = 'Approval',
  REJECTION = 'Rejection',
  NEW_MESSAGE = 'New Message',
  INFO = 'Info',
  WARNING = 'Warning',
  ERROR = 'Error'
}
