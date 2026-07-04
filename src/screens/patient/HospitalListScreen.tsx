import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PatientStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Rating } from '../../components/Rating';
import { useHospitals } from '../../context/HospitalsContext';
import { Hospital } from '../../types';
import { MapPin, Search, X, AlertCircle } from 'lucide-react-native';

type HospitalListScreenNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'HospitalList'>;

export const HospitalListScreen = () => {
  const navigation = useNavigation<HospitalListScreenNavigationProp>();
  const { hospitals, isLoading, refetchHospitals } = useHospitals();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchHospitals();
    setIsRefreshing(false);
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Hospital }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate('HospitalDetails', { hospitalId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Rating rating={item.rating} size={14} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <MapPin size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  if (isLoading && hospitals.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="All Facilities" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.noResultsContainer}>
      <AlertCircle size={40} color={colors.outline} style={styles.noResultsIcon} />
      <Text style={styles.noResultsTitle}>No Facilities Found</Text>
      <Text style={styles.noResultsSubtitle}>
        We couldn't find any medical facility matching "{searchQuery}"
      </Text>
      <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.resetButton}>
        <Text style={styles.resetText}>Show All Facilities</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="All Facilities" showBack />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={18} color={colors.onSurfaceVariant} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, address or description..."
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredHospitals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredHospitals.length === 0 && { flex: 1, justifyContent: 'center' }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.onBackground,
    ...typography.bodyMd,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    padding: 0,
    marginBottom: spacing.md,
    overflow: 'hidden',
    height: 110,
  },
  image: {
    width: 100,
    height: '100%',
    backgroundColor: colors.surfaceVariant,
  },
  infoContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  name: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: '700',
  },
  description: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
    color: colors.onSurface,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
  },
  // No Results
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: 60,
  },
  noResultsIcon: {
    marginBottom: spacing.sm,
  },
  noResultsTitle: {
    ...typography.headlineSm,
    color: colors.onBackground,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  noResultsSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetText: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
