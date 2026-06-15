export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
  receiverId: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}
