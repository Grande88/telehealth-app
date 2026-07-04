import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/Button';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
const { width } = Dimensions.get('window');

export const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* Placeholder for an actual illustration */}
        <View style={styles.placeholderImage} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Health,{'\n'}Our Priority</Text>
        <Text style={styles.subtitle}>
          Connect with top hospitals, manage your feedback, and ensure quality healthcare.
        </Text>

        <Button 
          title="Get Started" 
          onPress={() => navigation.replace('Login')} 
          style={styles.button} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    flex: 1.5,
    backgroundColor: colors.surfaceTint,
    borderBottomRightRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: colors.primaryContainer,
    borderRadius: 40,
    opacity: 0.2,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...typography.headlineLg,
    color: colors.onBackground,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xxl,
  },
  button: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});
