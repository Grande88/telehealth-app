import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, rounded } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Rating } from '../../components/Rating';
import { useFeedback } from '../../context/FeedbackContext';
import { useHospitals } from '../../context/HospitalsContext';

export const FeedbackHistoryScreen = () => {
  const { feedbackList, refetchFeedback } = useFeedback();
  const { hospitals } = useHospitals();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchFeedback();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return colors.success;
      case 'resolved': return colors.primary;
      case 'pending': return colors.warning;
      default: return colors.outline;
    }
  };

  const renderItem = ({ item }: { item: typeof feedbackList[0] }) => {
    const hospital = hospitals.find(h => h.id === item.hospitalId);

    return (
      <Card style={styles.card} statusColor={getStatusColor(item.status)}>
        <View style={styles.cardHeader}>
          <Text style={styles.hospitalName} numberOfLines={1}>{hospital?.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.ratingRow}>
          <Rating rating={item.rating} size={16} />
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.categoryText}>Category: {item.category}</Text>
        
        {item.comment ? (
          <Text style={styles.commentText}>{item.comment}</Text>
        ) : null}

        {item.adminResponse ? (
          <View style={styles.adminResponseContainer}>
            <Text style={styles.adminResponseHeader}>Official Response</Text>
            <Text style={styles.adminResponseText}>{item.adminResponse}</Text>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="My Feedback History" showBack />
      <FlatList
        data={feedbackList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't submitted any feedback yet.</Text>
          </View>
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
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hospitalName: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: rounded.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  commentText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  adminResponseContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: rounded.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  adminResponseHeader: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  adminResponseText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 18,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
