import React, { createContext, useContext, useState, useEffect } from 'react';
import { Feedback } from '../types';
import { mockFeedback } from '../utils/mockData';
import { feedbackApi } from '../services/api';
import { useProfile } from './ProfileContext';

interface FeedbackContextType {
  feedbackList: Feedback[];
  isLoading: boolean;
  submitFeedback: (
    hospitalId: string,
    rating: number,
    category: Feedback['category'],
    comment: string
  ) => Promise<void>;
  refetchFeedback: () => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uid } = useProfile();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = async () => {
    if (!uid) {
      setFeedbackList([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await feedbackApi.getByUser(uid);
      setFeedbackList(data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      setFeedbackList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [uid]);

  const submitFeedback = async (
    hospitalId: string,
    rating: number,
    category: Feedback['category'],
    comment: string
  ) => {
    if (!uid) return;
    try {
      const newFeedback = await feedbackApi.submit({
        hospitalId,
        userId: uid,
        rating,
        category,
        comment: comment.trim(),
      });
      setFeedbackList((prev) => [newFeedback, ...prev]);
    } catch (error) {
      console.error('Failed to submit feedback via API, inserting locally:', error);
      const newFeedback: Feedback = {
        id: `f_${Date.now()}`,
        status: 'pending',
        date: new Date().toISOString(),
        hospitalId,
        userId: uid,
        rating,
        category,
        comment: comment.trim(),
      };
      setFeedbackList((prev) => [newFeedback, ...prev]);
    }
  };

  return (
    <FeedbackContext.Provider value={{ feedbackList, isLoading, submitFeedback, refetchFeedback: fetchFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
