import { initializeApp } from 'firebase/app';
// @ts-ignore - TypeScript definitions don't always expose mobile-specific exports, but it exists at runtime in React Native
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase app
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
export const db = getFirestore(firebaseApp);
