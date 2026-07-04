import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Hospital {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  image: string;
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
  category: string;
  adminResponse?: string;
  adminNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
  phone?: string;
  joinDate: string;
  feedbackCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'alert' | 'success';
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getAll<T>(col: string): Promise<T[]> {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}

/** Fetch a collection ordered by createdAt descending (newest first).
 *  Falls back to unordered if the query fails (e.g. missing index). */
async function getAllOrdered<T>(col: string): Promise<T[]> {
  try {
    const q = query(collection(db, col), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  } catch {
    // Fallback: no index or legacy docs — return all unordered
    return getAll<T>(col);
  }
}

// ─── Hospitals ────────────────────────────────────────────────────────────────

export const adminHospitalsApi = {
  getAll: () => getAll<Hospital>('hospitals'),

  create: async (data: Omit<Hospital, 'id' | 'distance'>): Promise<Hospital> => {
    const distance = `${(Math.random() * 8 + 1).toFixed(1)} miles away`;
    const docData = { ...data, distance, createdAt: serverTimestamp() };
    const ref = await addDoc(collection(db, 'hospitals'), docData);
    return { id: ref.id, ...docData } as Hospital;
  },

  update: async (id: string, data: Partial<Hospital>): Promise<Hospital> => {
    const ref = doc(db, 'hospitals', id);
    await updateDoc(ref, data as Record<string, unknown>);
    const updated = await getDoc(ref);
    return { id: updated.id, ...updated.data() } as Hospital;
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, 'hospitals', id));
    return { success: true, message: `Hospital ${id} deleted` };
  },
};

// ─── Feedback ────────────────────────────────────────────────────────────────

export const adminFeedbackApi = {
  getAll: () => getAllOrdered<Feedback>('feedback'),

  update: async (id: string, data: Partial<Feedback>): Promise<Feedback> => {
    const ref = doc(db, 'feedback', id);
    await updateDoc(ref, data as Record<string, unknown>);
    const updated = await getDoc(ref);
    return { id: updated.id, ...updated.data() } as Feedback;
  },

  delete: async (id: string) => {
    const ref = doc(db, 'feedback', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Feedback;
      await deleteDoc(ref);
      // Decrement feedbackCount on user document
      if (data.userId) {
        try {
          await updateDoc(doc(db, 'users', data.userId), {
            feedbackCount: increment(-1),
          });
        } catch {
          // User doc may not exist — ignore
        }
      }
    }
    return { success: true, message: `Feedback ${id} deleted` };
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const adminNotificationsApi = {
  getAll: () => getAll<Notification>('notifications'),

  create: async (data: Omit<Notification, 'id' | 'date' | 'isRead'>): Promise<Notification> => {
    const docData = {
      ...data,
      isRead: false,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'notifications'), docData);
    return { id: ref.id, ...docData } as Notification;
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
    return { success: true, message: `Notification ${id} deleted` };
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const adminUsersApi = {
  getAll: () => getAll<User>('users'),

  create: async (data: Omit<User, 'id' | 'joinDate' | 'feedbackCount'>): Promise<User> => {
    const docData = {
      ...data,
      role: data.role ?? 'patient',
      joinDate: new Date().toISOString().split('T')[0],
      feedbackCount: 0,
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'users'), docData);
    return { id: ref.id, ...docData } as User;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const ref = doc(db, 'users', id);
    await updateDoc(ref, data as Record<string, unknown>);
    const updated = await getDoc(ref);
    return { id: updated.id, ...updated.data() } as User;
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
    return { success: true, message: `User ${id} deleted` };
  },
};
