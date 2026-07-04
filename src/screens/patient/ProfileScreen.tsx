import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PatientStackParamList, RootStackParamList } from '../../navigation/types';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { User, Settings, LogOut, ChevronRight, Edit3 } from 'lucide-react-native';
import { useProfile } from '../../context/ProfileContext';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PatientStackParamList, 'PatientTabs'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { profile, resetProfile } = useProfile();

  const handleLogout = () => {
    resetProfile();
    navigation.replace('Auth', { screen: 'Login' });
  };

  const renderMenuItem = (icon: React.ReactNode, title: string, onPress: () => void, isDestructive = false) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <Text style={[styles.menuTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      <ChevronRight size={20} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.avatarWrapper}
          >
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Edit3 size={12} color={colors.onPrimary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Edit3 size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            {renderMenuItem(
              <Settings size={22} color={colors.onSurfaceVariant} />, 
              'Settings', 
              () => navigation.navigate('Settings')
            )}
            <View style={styles.divider} />
            {renderMenuItem(
              <LogOut size={22} color={colors.error} />, 
              'Log Out', 
              handleLogout,
              true
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceVariant,
  },
  avatarInitials: {
    ...typography.headlineMd,
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    ...typography.headlineMd,
    color: colors.onBackground,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  editButtonText: {
    ...typography.labelMd,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'flex-start',
  },
  menuTitle: {
    ...typography.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginLeft: 48,
  },
});
