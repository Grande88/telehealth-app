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
import { ArrowLeft } from 'lucide-react-native';
import { useProfile } from '../../context/ProfileContext';
import { authApi } from '../../services/api';

type RegisterScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, 'Register'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loadProfile } = useProfile();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: 'patient',
        phone: phone.trim(),
      });

      await loadProfile(response.user.id, {
        name: response.user.name,
        email: response.user.email,
        phone: phone.trim(),
      });

      navigation.replace('Patient', { screen: 'PatientTabs', params: { screen: 'HomeTab' } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Please try again.');
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

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Telehealth to manage your health</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
          />
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
            label="Phone Number"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError(null);
            }}
          />
          <Input
            label="Password"
            placeholder="Create a password"
            isPassword
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            isPassword
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError(null);
            }}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button 
            title="Sign Up" 
            onPress={handleRegister} 
            loading={isLoading}
            style={styles.registerButton} 
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity 
            disabled={isLoading}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
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
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  loginText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
