import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PatientStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, rounded } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Rating } from '../../components/Rating';
import { useFeedback } from '../../context/FeedbackContext';
import { useHospitals } from '../../context/HospitalsContext';
import { AlertCircle, Check } from 'lucide-react-native';
import { Feedback } from '../../types';

type SubmitFeedbackRouteProp = RouteProp<PatientStackParamList, 'SubmitFeedback'>;
type SubmitFeedbackNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'SubmitFeedback'>;

const CATEGORIES: Feedback['category'][] = ['Wait Time', 'Staff', 'Cleanliness', 'Treatment', 'Other'];

export const SubmitFeedbackScreen = () => {
  const route = useRoute<SubmitFeedbackRouteProp>();
  const navigation = useNavigation<SubmitFeedbackNavigationProp>();
  const { hospitalId } = route.params;
  const { submitFeedback } = useFeedback();
  const { hospitals } = useHospitals();

  const hospital = hospitals.find(h => h.id === hospitalId) || hospitals[0] || { name: 'Facility' };

  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<Feedback['category'] | null>(null);
  const [comment, setComment] = useState('');
  
  const [ratingError, setRatingError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  const handleSubmit = () => {
    let hasError = false;

    if (rating === 0) {
      setRatingError(true);
      hasError = true;
    } else {
      setRatingError(false);
    }

    if (!category) {
      setCategoryError(true);
      hasError = true;
    } else {
      setCategoryError(false);
    }

    if (hasError) return;

    // Submit review using context
    submitFeedback(hospitalId, rating, category!, comment);

    // Redirect to history screen so they can see their post immediately
    navigation.replace('FeedbackHistory');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Provide Feedback" showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.subtitle}>How was your experience?</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Rating rating={rating} onRatingChange={(val) => {
            setRating(val);
            setRatingError(false);
          }} size={42} readOnly={false} />
          <Text style={[styles.ratingLabel, ratingError && styles.errorText]}>
            {rating === 0 
              ? (ratingError ? 'Please select a rating' : 'Tap a star to rate') 
              : `${rating} out of 5 Stars`}
          </Text>
        </View>

        {/* Category Chips Selector */}
        <View style={styles.section}>
          <Text style={[styles.inputLabel, categoryError && styles.errorText]}>
            Select Category {categoryError && ' (Required)'}
          </Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.7}
                  onPress={() => {
                    setCategory(cat);
                    setCategoryError(false);
                  }}
                  style={[
                    styles.chip,
                    isSelected && styles.selectedChip
                  ]}
                >
                  {isSelected && <Check size={14} color={colors.onPrimary} style={styles.chipIcon} />}
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.selectedChipText
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Text Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Additional Comments (Optional)</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder="Tell us what you liked or what could be improved..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Submit Feedback" 
          onPress={handleSubmit} 
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  hospitalName: {
    ...typography.headlineMd,
    color: colors.onBackground,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  ratingSection: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  ratingLabel: {
    ...typography.bodyMd,
    color: colors.primary,
    marginTop: spacing.md,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  selectedChipText: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  inputSection: {
    width: '100%',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: rounded.md,
    padding: spacing.md,
    ...typography.bodyMd,
    color: colors.onSurface,
    minHeight: 120,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  errorText: {
    color: colors.error,
  },
});
