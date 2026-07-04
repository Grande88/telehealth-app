import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: FirebaseUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Ensures the Firebase Auth user has a Firestore profile with role: admin */
async function ensureAdminProfile(user: FirebaseUser) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      name: user.displayName || (user.email ?? "Admin").split("@")[0],
      role: "admin",
      joinDate: new Date().toISOString().split("T")[0],
      feedbackCount: 0,
    });
    return "admin";
  }
  return snap.data()?.role as string | undefined;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          const role = snap.exists() ? snap.data()?.role : null;
          const adminStatus = role === "admin";
          setIsAdmin(adminStatus);
          setIsAuthenticated(adminStatus);
        } catch {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Create Firestore profile if this is the first admin login
      const role = await ensureAdminProfile(cred.user);
      if (role === "admin") {
        setIsAdmin(true);
        setIsAuthenticated(true);
        return true;
      }
      // Not an admin — sign them out immediately
      await signOut(auth);
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
