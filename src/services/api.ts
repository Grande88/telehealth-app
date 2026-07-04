import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  increment,
  setDoc,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { Feedback, Notification } from '../types';

// ─── Feedback ────────────────────────────────────────────────────────────────

export const feedbackApi = {
  /** Fetch all feedback documents */
  getAll: async (): Promise<Feedback[]> => {
    const snap = await getDocs(collection(db, 'feedback'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
  },

  /** Fetch feedback submitted by a specific user */
  getByUser: async (userId: string): Promise<Feedback[]> => {
    const q = query(collection(db, 'feedback'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
  },

  /** Submit new feedback and increment the user's feedbackCount */
  submit: async (data: Omit<Feedback, 'id' | 'date' | 'status'>): Promise<Feedback> => {
    const docData = {
      ...data,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'feedback'), docData);

    // Increment feedbackCount on the user's document
    if (data.userId) {
      const userRef = doc(db, 'users', data.userId);
      try {
        await updateDoc(userRef, { feedbackCount: increment(1) });
      } catch {
        // User doc may not exist yet — ignore
      }
    }

    return { id: ref.id, ...docData } as unknown as Feedback;
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  /** Fetch all notifications */
  getAll: async (): Promise<Notification[]> => {
    const snap = await getDocs(collection(db, 'notifications'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
  },

  /** Fetch notifications for a specific user */
  getByUser: async (userId: string): Promise<Notification[]> => {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
  },

  /** Mark a notification as read */
  markAsRead: async (id: string): Promise<void> => {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  },
};

// ─── Hospitals ────────────────────────────────────────────────────────────────

export const hospitalsApi = {
  /** Fetch all hospitals */
  getAll: async () => {
    const snap = await getDocs(collection(db, 'hospitals'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileApi = {
  /** Fetch a user profile by UID from Firestore */
  getByUid: async (uid: string) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as {
        id: string;
        name: string;
        email: string;
        phone?: string;
        avatar?: string | null;
        role: string;
      };
    }
    return null;
  },

  /** Update the user profile in both Firestore and Firebase Auth */
  update: async (uid: string, data: { name?: string; email?: string; phone?: string; avatar?: string | null }) => {
    // Update Firestore document
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { ...data });

    // Also update Firebase Auth displayName if name changed
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.name });
    }
  },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  /** Sign in an existing user with Firebase Authentication */
  login: async (data: { email: string; password: string }) => {
    const { email, password } = data;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Ensure a Firestore profile document exists
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        name: user.displayName || email.split('@')[0],
        role: 'patient',
        joinDate: new Date().toISOString().split('T')[0],
        feedbackCount: 0,
      }, { merge: true });
    }

    const updatedSnap = await getDoc(userRef);
    const profile = updatedSnap.exists() ? updatedSnap.data() : {};

    return {
      token: await user.getIdToken(),
      user: {
        id: user.uid,
        email: user.email ?? email,
        name: (profile as any).name ?? user.displayName ?? email.split('@')[0],
        role: (profile as any).role ?? 'patient',
      },
    };
  },

  /** Register a new user with Firebase Authentication and create a Firestore profile */
  register: async (data: { email: string; password: string; name: string; role?: string; phone?: string }) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = cred.user;

    // Set display name in Firebase Auth
    await updateProfile(user, { displayName: data.name });

    // Create Firestore profile document keyed by UID
    const userProfile = {
      id: user.uid,
      email: data.email,
      name: data.name,
      role: data.role ?? 'patient',
      joinDate: new Date().toISOString().split('T')[0],
      feedbackCount: 0,
      phone: data.phone ?? '',
    };
    await setDoc(doc(db, 'users', user.uid), userProfile);

    return {
      token: await user.getIdToken(),
      user: {
        id: user.uid,
        email: data.email,
        name: data.name,
        role: data.role ?? 'patient',
      },
    };
  },

  /** Sign out the current user */
  logout: async () => {
    await auth.signOut();
  },

  /** Send password reset email with a continue URL back to the app's auth domain */
  resetPassword: async (email: string) => {
    await sendPasswordResetEmail(auth, email, {
      // After resetting, Firebase redirects the user here.
      // This must match one of the Authorized Domains in Firebase Console → Authentication → Settings.
      url: 'https://telehealth-app-d5096.firebaseapp.com',
      handleCodeInApp: false, // open the reset link in a browser, not inside the app
    });
  },
};
