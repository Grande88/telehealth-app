import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for "Telehealth app" project
const firebaseConfig = {
  apiKey: "AIzaSyBsUAgp6nnblXkqJxkpt2DVl37zQATA3lQ",
  authDomain: "telehealth-app-d5096.firebaseapp.com",
  projectId: "telehealth-app-d5096",
  storageBucket: "telehealth-app-d5096.firebasestorage.app",
  messagingSenderId: "106511829554",
  appId: "1:106511829554:web:390233e2c359070e738a2b",
  measurementId: "G-LQKVQW7SPD",
};

// Prevent duplicate app initialisation in dev hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
