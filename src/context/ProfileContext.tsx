import React, { createContext, useContext, useState, useCallback } from 'react';
import { profileApi } from '../services/api';

interface Profile {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface ProfileContextType {
  uid: string | null;
  profile: Profile;
  isSaving: boolean;
  loadProfile: (uid: string, fallback?: Partial<Profile>) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetProfile: () => void;
}

const defaultProfile: Profile = {
  name: 'User',
  email: '',
  phone: '',
  avatar: null,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Load the user profile from Firestore by UID.
   * Falls back to the provided fallback data (e.g. from authApi.login response).
   */
  const loadProfile = useCallback(async (userUid: string, fallback?: Partial<Profile>) => {
    setUid(userUid);

    // Apply fallback immediately so the UI shows something right away
    if (fallback) {
      setProfile((prev) => ({ ...prev, ...fallback }));
    }

    try {
      const firestoreProfile = await profileApi.getByUid(userUid);
      if (firestoreProfile) {
        setProfile({
          name: firestoreProfile.name || fallback?.name || defaultProfile.name,
          email: firestoreProfile.email || fallback?.email || defaultProfile.email,
          phone: firestoreProfile.phone || fallback?.phone || defaultProfile.phone,
          avatar: firestoreProfile.avatar ?? fallback?.avatar ?? null,
        });
      }
    } catch (err) {
      console.warn('Failed to load profile from Firestore, using fallback:', err);
    }
  }, []);

  /**
   * Update the profile both locally and in Firestore.
   */
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    setIsSaving(true);
    try {
      // Persist to Firestore if we have a UID
      if (uid) {
        await profileApi.update(uid, updates);
      }
      // Update local state
      setProfile((prev) => ({ ...prev, ...updates }));
    } finally {
      setIsSaving(false);
    }
  }, [uid]);

  /**
   * Reset profile state (e.g. on logout).
   */
  const resetProfile = useCallback(() => {
    setUid(null);
    setProfile(defaultProfile);
  }, []);

  return (
    <ProfileContext.Provider value={{ uid, profile, isSaving, loadProfile, updateProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
