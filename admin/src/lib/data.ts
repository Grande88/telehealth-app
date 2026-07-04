// Mock data for the admin dashboard — mirrors the mobile app's data model

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
  status: "pending" | "reviewed" | "resolved";
  category: string;
  adminResponse?: string;
  adminNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "admin";
  phone?: string;
  joinDate: string;
  feedbackCount: number;
}

export interface Analytics {
  totalFeedback: number;
  averageRating: number;
  positiveFeedbackPercentage: number;
  recentFeedbackCount: number;
}

const LOCAL_STORAGE_HOSPITALS_KEY = "telehealth_hospitals_list";

if (typeof window !== "undefined" && window.localStorage) {
  localStorage.removeItem("telehealth_hospitals_list");
  localStorage.removeItem("telehealth_feedback_list");
  localStorage.removeItem("telehealth_users_list");
}

const defaultHospitalsList: Hospital[] = [];

export let hospitals: Hospital[] = (() => {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = localStorage.getItem(LOCAL_STORAGE_HOSPITALS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored hospitals list", e);
      }
    }
  }
  return defaultHospitalsList;
})();

const LOCAL_STORAGE_KEY = "telehealth_feedback_list";

const defaultFeedbackList: Feedback[] = [];

export let feedbackList: Feedback[] = (() => {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored feedback list", e);
      }
    }
  }
  return defaultFeedbackList;
})();

const LOCAL_STORAGE_USERS_KEY = "telehealth_users_list";

const defaultUsersList: User[] = [
  { id: "admin1", name: "Admin", email: "admin@telehealth.com", role: "admin", joinDate: "2025-11-01", feedbackCount: 0 },
];

export let users: User[] = (() => {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored users list", e);
      }
    }
  }
  return defaultUsersList;
})();

export const analytics: Analytics = {
  totalFeedback: 0,
  averageRating: 0,
  positiveFeedbackPercentage: 0,
  recentFeedbackCount: 0,
};

// Monthly feedback trend for charts
export const monthlyFeedback = [
  { month: "Jan", count: 0 },
  { month: "Feb", count: 0 },
  { month: "Mar", count: 0 },
  { month: "Apr", count: 0 },
  { month: "May", count: 0 },
  { month: "Jun", count: 0 },
];

// Category breakdown
export const categoryBreakdown = [
  { category: "Cleanliness", count: 0, percentage: 0 },
  { category: "Wait Time", count: 0, percentage: 0 },
  { category: "Staff", count: 0, percentage: 0 },
  { category: "Communication", count: 0, percentage: 0 },
  { category: "Billing", count: 0, percentage: 0 },
  { category: "General", count: 0, percentage: 0 },
];

export function updateFeedback(id: string, updates: Partial<Feedback>) {
  const fb = feedbackList.find(f => f.id === id);
  if (fb) {
    Object.assign(fb, updates);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(feedbackList));
    }
  }
}

export function deleteFeedback(id: string) {
  const index = feedbackList.findIndex(f => f.id === id);
  if (index !== -1) {
    feedbackList.splice(index, 1);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(feedbackList));
    }
  }
}

export function addHospital(hospital: Omit<Hospital, "id" | "distance">) {
  const newHospital: Hospital = {
    ...hospital,
    id: `h${Date.now()}`,
    distance: `${(Math.random() * 8 + 1).toFixed(1)} miles away`,
  };
  hospitals.push(newHospital);
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_HOSPITALS_KEY, JSON.stringify(hospitals));
  }
  return newHospital;
}

export function updateHospital(id: string, updates: Partial<Hospital>) {
  const hospital = hospitals.find(h => h.id === id);
  if (hospital) {
    Object.assign(hospital, updates);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_HOSPITALS_KEY, JSON.stringify(hospitals));
    }
  }
}

export function removeHospital(id: string) {
  const index = hospitals.findIndex(h => h.id === id);
  if (index !== -1) {
    hospitals.splice(index, 1);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_HOSPITALS_KEY, JSON.stringify(hospitals));
    }
  }
}

export function addUser(user: Omit<User, "id">) {
  const newUser: User = {
    ...user,
    id: `u${Date.now()}`,
  };
  users.push(newUser);
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  }
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>) {
  const user = users.find(u => u.id === id);
  if (user) {
    Object.assign(user, updates);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    }
  }
}

export function deleteUser(id: string) {
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    }
  }
}
