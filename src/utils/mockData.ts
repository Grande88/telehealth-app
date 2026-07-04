import { Hospital, Feedback, User, Notification, Analytics } from '../types';

export const mockUsers: User[] = [];

export const mockHospitals: Hospital[] = [];

export const mockFeedback: Feedback[] = [];

export const mockNotifications: Notification[] = [];

export const mockAnalytics: Analytics = {
  totalFeedback: 0,
  averageRating: 0,
  positiveFeedbackPercentage: 0,
  recentFeedbackCount: 0,
};
