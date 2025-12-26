export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  message: string;
  messageType: "text" | "booking-update" | "system";
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  
  // User info
  userId: string;
  userName: string;
  userEmail: string;
  
  // Admin info (when assigned)
  assignedAdminId?: string;
  assignedAdminName?: string;
  
  // Conversation state
  status: "open" | "pending" | "resolved" | "closed";
  subject?: string;
  
  // Last message preview
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: "user" | "admin";
  
  // Unread counts
  unreadByUser: number;
  unreadByAdmin: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Related booking (optional)
  relatedBookingId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "booking-status" | "booking-reminder" | "system";
  title: string;
  body: string;
  data?: {
    conversationId?: string;
    bookingId?: string;
    senderId?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}
