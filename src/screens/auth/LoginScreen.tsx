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
import { Stethoscope } from 'lucide-react-native';
import { useProfile } from '../../context/ProfileContext';
import { authApi } from '../../services/api';

type LoginScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Login'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loadProfile } = useProfile();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });
      
      await loadProfile(response.user.id, {
        name: response.user.name,
        email: response.user.email,
        phone: '',
      });

      navigation.replace('Patient', { screen: 'PatientTabs', params: { screen: 'HomeTab' } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password. Please try again.');
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
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Stethoscope size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Telehealth</Text>
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
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            isPassword
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
          />
          
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button 
            title="Sign In" 
            onPress={handleLogin} 
            loading={isLoading}
            style={styles.loginButton} 
          />
          
          <Button 
            title="Create an Account" 
            variant="outline"
            disabled={isLoading}
            onPress={() => navigation.navigate('Register')} 
            style={styles.registerButton}
          />
        </View>

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
    justifyContent: 'center',
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
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  form: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: spacing.md,
  },
  registerButton: {
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

});
