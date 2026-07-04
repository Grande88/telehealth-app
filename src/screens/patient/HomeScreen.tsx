import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
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
import { Search, MapPin, ChevronRight, X, AlertCircle } from 'lucide-react-native';
import { useNotifications } from '../../context/NotificationsContext';
import { useProfile } from '../../context/ProfileContext';
import { Hospital } from '../../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'PatientTabs'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
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

  const renderHospitalCard = ({ item }: { item: Hospital }) => (
    <Card 
      style={styles.hospitalCard}
      onPress={() => navigation.navigate('HospitalDetails', { hospitalId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.hospitalImage} />
      <View style={styles.hospitalInfo}>
        <Text style={styles.hospitalName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.hospitalDistance}>{item.distance}</Text>
        </View>
      </View>
    </Card>
  );

  const renderSearchResultItem = ({ item }: { item: Hospital }) => (
    <Card
      style={styles.searchResultCard}
      onPress={() => navigation.navigate('HospitalDetails', { hospitalId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.searchResultImage} />
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.searchResultDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.searchResultFooter}>
          <View style={styles.ratingRow}>
            <Rating rating={item.rating} size={12} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={12} color={colors.onSurfaceVariant} />
            <Text style={styles.hospitalDistance}>{item.distance}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={18} color={colors.outline} style={styles.chevron} />
    </Card>
  );

  if (isLoading && hospitals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <Header 
        title="Telehealth" 
        showNotifications 
        unreadCount={unreadCount} 
        onNotificationPress={() => navigation.navigate('PatientTabs', { screen: 'NotificationsTab' })}
      />
      
      {/* Active Search Input */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarWrapper}>
          <Search size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search hospitals, clinics, address..."
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.searchInput}
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showSearchResults ? (
        <View style={styles.searchResultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Search Results</Text>
            <Text style={styles.resultsCount}>
              {filteredHospitals.length} found
            </Text>
          </View>

          {filteredHospitals.length > 0 ? (
            <FlatList
              data={filteredHospitals}
              renderItem={renderSearchResultItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.verticalListContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <AlertCircle size={48} color={colors.outline} style={styles.noResultsIcon} />
              <Text style={styles.noResultsTitle}>No Hospitals Found</Text>
              <Text style={styles.noResultsSubtitle}>
                We couldn't find any healthcare facilities matching "{searchQuery}"
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.resetSearchButton}>
                <Text style={styles.resetSearchText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{profile.name}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HospitalList')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={hospitals}
            renderItem={renderHospitalCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('FeedbackHistory')}>
              <View style={styles.actionContent}>
                <View>
                  <Text style={styles.actionTitle}>My Feedback</Text>
                  <Text style={styles.actionSubtitle}>View your past reviews</Text>
                </View>
                <ChevronRight size={24} color={colors.onSurfaceVariant} />
              </View>
            </Card>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  greeting: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  userName: {
    ...typography.headlineMd,
    color: colors.onBackground,
    marginTop: spacing.xs,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.onBackground,
    ...typography.bodyMd,
    paddingVertical: 0, // important for android line height alignment
  },
  clearButton: {
    padding: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onBackground,
  },
  seeAll: {
    ...typography.labelMd,
    color: colors.primary,
  },
  horizontalList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  hospitalCard: {
    width: 200,
    marginRight: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  hospitalImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceVariant,
  },
  hospitalInfo: {
    padding: spacing.md,
  },
  hospitalName: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalDistance: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
  },
  quickActions: {
    padding: spacing.md,
    paddingTop: 0,
  },
  actionCard: {
    marginTop: spacing.sm,
  },
  actionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    ...typography.bodyLg,
    fontWeight: '600',
    color: colors.onSurface,
  },
  actionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  // Search Results Styles
  searchResultsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  resultsTitle: {
    ...typography.headlineSm,
    color: colors.onBackground,
    fontWeight: '700',
  },
  resultsCount: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  verticalListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  searchResultCard: {
    flexDirection: 'row',
    padding: 0,
    marginBottom: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  searchResultImage: {
    width: 100,
    height: '100%',
    minHeight: 110,
    backgroundColor: colors.surfaceVariant,
  },
  searchResultInfo: {
    flex: 1,
    padding: spacing.md,
  },
  searchResultName: {
    ...typography.bodyLg,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4,
  },
  searchResultDescription: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  searchResultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: 4,
    color: colors.onSurface,
  },
  chevron: {
    marginRight: spacing.sm,
  },
  // No Results Styles
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: 40,
  },
  noResultsIcon: {
    marginBottom: spacing.md,
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
    marginBottom: spacing.lg,
  },
  resetSearchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  resetSearchText: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
