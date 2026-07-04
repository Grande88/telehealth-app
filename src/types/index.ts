export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
  avatar?: string;
  phone?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  rating: number;
  image: string;
  distance?: string;
  description: string;
}

export interface Feedback {
  id: string;
  hospitalId: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
  category: 'Wait Time' | 'Staff' | 'Cleanliness' | 'Treatment' | 'Other';
  adminResponse?: string;
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'system' | 'feedback' | 'appointment' | 'info' | 'alert' | 'success';
}

export interface Analytics {
  totalFeedback: number;
  averageRating: number;
  positiveFeedbackPercentage: number;
  recentFeedbackCount: number;
}
