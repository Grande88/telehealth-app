import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { useNotifications } from '../../context/NotificationsContext';
import { Notification } from '../../types';
import {
  Bell,
  FileText,
  CheckCircle,
  Clock,
  Trash2,
  Inbox,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react-native';

export const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetchNotifications,
  } = useNotifications();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchNotifications();
    setIsRefreshing(false);
  };

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const getIcon = (type: string, isRead: boolean) => {
    const iconSize = 22;
    if (isRead) {
      switch (type) {
        case 'feedback':
          return <FileText color={colors.onSurfaceVariant} size={iconSize} />;
        case 'system':
          return <CheckCircle color={colors.onSurfaceVariant} size={iconSize} />;
        default:
          return <Bell color={colors.onSurfaceVariant} size={iconSize} />;
      }
    } else {
      switch (type) {
        case 'feedback':
          return <FileText color={colors.secondary} size={iconSize} />;
        case 'system':
          return <CheckCircle color={colors.success} size={iconSize} />;
        default:
          return <Bell color={colors.primary} size={iconSize} />;
      }
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'feedback':
        return styles.feedbackBadge;
      case 'system':
        return styles.systemBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleNotificationPress(item)}
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
    >
      <View style={[styles.iconContainer, getBadgeStyle(item.type)]}>
        {getIcon(item.type, item.isRead)}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.isRead && styles.unreadText]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.metaRow}>
          <Clock size={12} color={colors.outline} style={styles.metaIcon} />
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString()} at{' '}
            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.outline} style={styles.chevron} />
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (notifications.length === 0) return null;
    return (
      <View style={styles.actionsHeader}>
        <Text style={styles.notificationsCount}>
          {unreadCount} unread of {notifications.length} alerts
        </Text>
        <View style={styles.actionButtonsRow}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.headerActionButton}>
              <Text style={styles.headerActionText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Inbox size={48} color={colors.outline} />
      </View>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySubtitle}>
        You have no new notifications. We'll alert you when there's an update.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && { flex: 1, justifyContent: 'center' }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Notification Detail Modal */}
      <Modal
        visible={selectedNotification !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header Indicator */}
            <View style={styles.modalHeaderIndicator} />

            {selectedNotification && (
              <View style={styles.modalBody}>
                {/* Icon & Title */}
                <View style={styles.modalHeaderRow}>
                  <View style={[styles.modalIconContainer, getBadgeStyle(selectedNotification.type)]}>
                    {getIcon(selectedNotification.type, false)}
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalBadgeText}>{selectedNotification.type.toUpperCase()}</Text>
                    <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                  </View>
                </View>

                {/* Date */}
                <View style={styles.modalDateRow}>
                  <Clock size={14} color={colors.onSurfaceVariant} />
                  <Text style={styles.modalDate}>
                    {new Date(selectedNotification.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(selectedNotification.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {/* Message Body */}
                <View style={styles.modalMessageContainer}>
                  <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
                </View>

                {/* Actions */}
                <View style={styles.modalActionsContainer}>
                  {selectedNotification.type === 'feedback' && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedNotification(null);
                        navigation.navigate('FeedbackHistory');
                      }}
                      style={styles.primaryActionButton}
                    >
                      <FileText size={18} color={colors.onPrimary} />
                      <Text style={styles.primaryActionText}>View Feedback History</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.secondaryActionsRow}>
                    <TouchableOpacity
                      onPress={() => {
                        deleteNotification(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      style={styles.deleteActionButton}
                    >
                      <Trash2 size={16} color={colors.error} />
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedNotification(null)}
                      style={styles.closeActionButton}
                    >
                      <Text style={styles.closeActionText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  notificationsCount: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerActionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: colors.primary + '08', // Super light emerald tint
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  feedbackBadge: {
    backgroundColor: colors.secondary + '12',
  },
  systemBadge: {
    backgroundColor: colors.success + '12',
  },
  defaultBadge: {
    backgroundColor: colors.primary + '12',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadText: {
    fontWeight: '700',
    color: colors.onBackground,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  date: {
    ...typography.caption,
    color: colors.outline,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.onBackground,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // slate-900 with opacity
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeaderIndicator: {
    width: 36,
    height: 4,
    backgroundColor: colors.outlineVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalBody: {
    marginTop: spacing.xs,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.onBackground,
    fontWeight: '700',
  },
  modalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  modalDate: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  modalMessageContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.xl,
  },
  modalMessage: {
    ...typography.bodyMd,
    color: colors.onBackground,
    lineHeight: 22,
  },
  modalActionsContainer: {
    gap: spacing.sm,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    height: 48,
  },
  primaryActionText: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  deleteActionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.errorContainer,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteActionText: {
    ...typography.bodyMd,
    color: colors.error,
    fontWeight: '600',
  },
  closeActionButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
});
