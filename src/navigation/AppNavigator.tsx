import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* We can control the initial route based on authentication state later */}
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Patient" component={PatientNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
