import axios, { type AxiosInstance } from 'axios';
import type {
  UserProfile,
  ProfileUpdateRequest,
  EmailSummary,
  EmailDetail,
  SendEmailRequest,
  SentEmailStatus,
  RefineRequest,
  ReplyRequest,
} from '@/types';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with credentials enabled for session cookies
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Auth API
export const authApi = {
  login: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },
};

// Profile API
export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },

  updateProfile: async (profile: ProfileUpdateRequest): Promise<UserProfile> => {
    const response = await apiClient.post('/api/profile', profile);
    return response.data;
  },
};

// Email API
export const emailApi = {
  getInbox: async (): Promise<EmailSummary[]> => {
    const response = await apiClient.get('/api/emails/inbox');
    return response.data;
  },

  getEmailById: async (id: string): Promise<EmailDetail> => {
    const response = await apiClient.get(`/api/emails/inbox/${id}`);
    return response.data;
  },

  sendEmail: async (email: SendEmailRequest): Promise<void> => {
    await apiClient.post('/api/emails/send', email);
  },

  getSentStatus: async (): Promise<SentEmailStatus[]> => {
    const response = await apiClient.get('/api/emails/sent-status');
    return response.data;
  },
};

// AI API
export const aiApi = {
  refine: async (request: RefineRequest): Promise<string> => {
    const response = await apiClient.post('/api/ai/refine', request);
    return response.data;
  },

  generateReply: async (request: ReplyRequest): Promise<string> => {
    const response = await apiClient.post('/api/ai/reply', request);
    return response.data;
  },
};

export default apiClient;
