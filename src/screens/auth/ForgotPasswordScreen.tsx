import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react-native';
import { authApi } from '../../services/api';

type ForgotPasswordScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds remaining before resend is allowed

  // Start a 60-second cooldown after sending
  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (cooldown > 0) return; // guard against double-tap

    setError(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword(email.trim());
      setIsSuccess(true);
      startCooldown();
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please wait a moment before trying again.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection and try again.');
          break;
        default:
          setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          disabled={isLoading}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.onBackground} />
        </TouchableOpacity>

        {!isSuccess ? (
          <>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <KeyRound size={48} color={colors.primary} />
              </View>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                error={error ?? undefined}
              />

              <Button 
                title="Send Reset Link" 
                onPress={handleResetPassword} 
                loading={isLoading}
                style={styles.submitButton} 
              />
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successLogoContainer}>
              <Mail size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              We have sent a password reset link to:
            </Text>
            <Text style={styles.emailHighlight}>{email.trim()}</Text>
            <Text style={styles.successDescription}>
              Please check your inbox and follow the instructions in the email to reset your password. If you don't see it, check your spam folder.
            </Text>

            <Button 
              title="Back to Sign In" 
              onPress={() => navigation.navigate('Login')} 
              style={styles.backToLoginButton} 
            />

            <TouchableOpacity 
              onPress={handleResetPassword}
              disabled={isLoading || cooldown > 0}
              style={[styles.resendContainer, (isLoading || cooldown > 0) && styles.resendDisabled]}
            >
              <Text style={[styles.resendText, cooldown > 0 && styles.resendTextMuted]}>
                {isLoading
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Didn't receive the email? Resend"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onBackground,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  successLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successSubtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emailHighlight: {
    ...typography.bodyLg,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  successDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  backToLoginButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  resendContainer: {
    padding: spacing.sm,
  },
  resendDisabled: {
    opacity: 0.5,
  },
  resendText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '600',
  },
  resendTextMuted: {
    color: colors.onSurfaceVariant,
  },
});
