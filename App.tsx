import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { FeedbackProvider } from './src/context/FeedbackContext';
import { HospitalsProvider } from './src/context/HospitalsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <HospitalsProvider>
          <FeedbackProvider>
            <NotificationsProvider>
              <AppNavigator />
            </NotificationsProvider>
          </FeedbackProvider>
        </HospitalsProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
