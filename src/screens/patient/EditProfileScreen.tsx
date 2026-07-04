import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PatientStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useProfile } from '../../context/ProfileContext';
import { Camera, X, Globe, Check, CircleCheck } from 'lucide-react-native';

type EditProfileNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'EditProfile'>;

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
];

export const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const { profile, updateProfile, isSaving } = useProfile();
  
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [avatar, setAvatar] = useState<string | null>(profile.avatar);

  // Modal and custom URL states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar,
      });

      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1200);
    } catch (err: any) {
      Alert.alert(
        'Update Failed',
        err.message || 'Could not save your profile changes. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatar(url);
    setIsSheetOpen(false);
    setShowCustomInput(false);
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim().startsWith('http')) {
      setAvatar(customUrl.trim());
      setCustomUrl('');
      setShowCustomInput(false);
      setIsSheetOpen(false);
    }
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Edit Profile" showBack />
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Avatar Editor Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={() => setIsSheetOpen(true)}
            style={styles.avatarWrapper}
            disabled={isSaving}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(name || 'P')}</Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Camera size={16} color={colors.onPrimary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsSheetOpen(true)} 
            style={styles.changePhotoButton}
            disabled={isSaving}
          >
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Info Inputs */}
        <Input
          label="Full Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          editable={!isSaving}
        />
        <Input
          label="Email Address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSaving}
        />
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={!isSaving}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={isSaving ? "Saving..." : "Save Changes"} 
          onPress={handleSave} 
          loading={isSaving}
          disabled={isSaving}
        />
      </View>

      {/* Success Toast Overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <CircleCheck size={40} color={colors.primary} />
            <Text style={styles.successText}>Profile Updated!</Text>
          </View>
        </View>
      )}

      {/* Avatar Picker Bottom Sheet Modal */}
      <Modal
        visible={isSheetOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSheetOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSheetOpen(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Indicator bar */}
            <View style={styles.modalIndicator} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Profile Photo</Text>
              <TouchableOpacity onPress={() => setIsSheetOpen(false)}>
                <X size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Select from beautiful avatars or paste a custom image URL</Text>

            {/* Presets Grid */}
            <View style={styles.presetsGrid}>
              {AVATAR_PRESETS.map((url, idx) => {
                const isSelected = avatar === url;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectPreset(url)}
                    style={[styles.presetItem, isSelected && styles.selectedPresetItem]}
                  >
                    <Image source={{ uri: url }} style={styles.presetImage} />
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Check size={10} color={colors.onPrimary} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom URL Toggle */}
            {!showCustomInput ? (
              <TouchableOpacity 
                onPress={() => setShowCustomInput(true)}
                style={styles.customUrlToggle}
              >
                <Globe size={16} color={colors.primary} />
                <Text style={styles.customUrlToggleText}>Or paste custom image URL</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.customInputContainer}>
                <TextInput
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor={colors.outline}
                  style={styles.customTextInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <TouchableOpacity 
                  onPress={handleApplyCustomUrl}
                  disabled={!customUrl.trim().startsWith('http')}
                  style={[
                    styles.applyCustomButton,
                    !customUrl.trim().startsWith('http') && styles.applyCustomButtonDisabled
                  ]}
                >
                  <Text style={styles.applyCustomText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Clear photo button */}
            {avatar && (
              <TouchableOpacity 
                onPress={() => {
                  setAvatar(null);
                  setIsSheetOpen(false);
                }} 
                style={styles.removePhotoButton}
              >
                <Text style={styles.removePhotoText}>Remove Current Photo</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surfaceVariant,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.headlineMd,
    color: colors.onPrimary,
    fontWeight: 'bold',
    fontSize: 28,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  changePhotoButton: {
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  changePhotoText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  // Success Toast
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successCard: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderRadius: 20,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  successText: {
    ...typography.headlineSm,
    color: colors.primary,
    fontWeight: '700',
  },
  // Modal Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingTop: spacing.xs,
  },
  modalIndicator: {
    width: 36,
    height: 4,
    backgroundColor: colors.outlineVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    ...typography.headlineSm,
    fontWeight: '700',
    color: colors.onBackground,
  },
  modalSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  presetItem: {
    position: 'relative',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  selectedPresetItem: {
    borderColor: colors.primary,
  },
  presetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  customUrlToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  customUrlToggleText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '700',
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  customTextInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    color: colors.onBackground,
    ...typography.bodyMd,
    backgroundColor: colors.background,
  },
  applyCustomButton: {
    backgroundColor: colors.primary,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCustomButtonDisabled: {
    backgroundColor: colors.outlineVariant,
  },
  applyCustomText: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  removePhotoButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    marginTop: spacing.xs,
  },
  removePhotoText: {
    ...typography.bodyMd,
    color: colors.error,
    fontWeight: '700',
  },
});
