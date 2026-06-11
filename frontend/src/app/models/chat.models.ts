export interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  receiver: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  isTyping?: boolean;
  read: boolean;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ChatConversation {
  id: string;
  requestId: string;
  participant1: string;
  participant1Id: string;
  participant2: string;
  participant2Id: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export interface SendChatMessage {
  message: string;
  attachments?: ChatAttachment[];
}
