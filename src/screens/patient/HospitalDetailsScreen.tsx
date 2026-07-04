import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PatientStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Rating } from '../../components/Rating';
import { MapPin } from 'lucide-react-native';
import { useHospitals } from '../../context/HospitalsContext';

type HospitalDetailsRouteProp = RouteProp<PatientStackParamList, 'HospitalDetails'>;
type HospitalDetailsNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'HospitalDetails'>;

export const HospitalDetailsScreen = () => {
  const route = useRoute<HospitalDetailsRouteProp>();
  const navigation = useNavigation<HospitalDetailsNavigationProp>();
  const { hospitalId } = route.params;
  const { hospitals } = useHospitals();

  const hospital = hospitals.find(h => h.id === hospitalId);

  if (!hospital) {
    return (
      <View style={styles.container}>
        <Header title="Facility Details" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Facility not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={hospital.name} showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: hospital.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.name}>{hospital.name}</Text>
          
          <View style={styles.ratingRow}>
            <Rating rating={hospital.rating} />
            <Text style={styles.ratingText}>{hospital.rating} out of 5</Text>
          </View>

          <View style={styles.addressRow}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.addressText}>{hospital.address}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{hospital.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Provide Feedback" 
          onPress={() => navigation.navigate('SubmitFeedback', { hospitalId: hospital.id })}
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
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.surfaceVariant,
  },
  content: {
    padding: spacing.lg,
  },
  name: {
    ...typography.headlineMd,
    color: colors.onBackground,
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  addressText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    marginLeft: spacing.sm,
    flex: 1,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onBackground,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.bodyLg,
    color: colors.error,
    textAlign: 'center',
  },
});
