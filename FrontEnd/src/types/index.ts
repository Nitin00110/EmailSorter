// User Profile Types
export interface UserProfile {
  email: string;
  name: string;
  age: number;
  gender: string;
  phoneNumber: string;
  workingIn: string;
}

export interface ProfileUpdateRequest {
  age: number;
  gender: string;
  phoneNumber: string;
  workingIn: string;
}

// Email Types
export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  date: string;
}

export interface EmailDetail extends EmailSummary {
  body: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

// Tracking Types
export interface SentEmailStatus {
  trackingId: string;
  recipientEmail: string;
  subject: string;
  isRead: boolean;
  readAt: string | null;
}

// AI Types
export interface RefineRequest {
  draft: string;
}

export interface ReplyRequest {
  originalEmail: string;
  intent: string;
}
