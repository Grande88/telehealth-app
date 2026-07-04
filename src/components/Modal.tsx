import React from 'react';
import { View, Text, StyleSheet, Modal as RNModal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, rounded } from '../theme/spacing';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  primaryAction?: {
    title: string;
    onPress: () => void;
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.header}>
                {title ? (
                  <Text style={styles.title}>{title}</Text>
                ) : (
                  <View />
                )}
                <TouchableWithoutFeedback onPress={onClose}>
                  <View style={styles.closeButton}>
                    <X size={24} color={colors.onSurfaceVariant} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
              
              <View style={styles.content}>
                {children}
              </View>

              {(primaryAction || secondaryAction) && (
                <View style={styles.footer}>
                  {secondaryAction && (
                    <Button
                      title={secondaryAction.title}
                      onPress={secondaryAction.onPress}
                      variant="outline"
                      style={styles.actionButton}
                    />
                  )}
                  {primaryAction && (
                    <Button
                      title={primaryAction.title}
                      onPress={primaryAction.onPress}
                      variant="primary"
                      style={styles.actionButton}
                    />
                  )}
                </View>
              )}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // onBackground with 40% opacity
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: rounded.lg,
    overflow: 'hidden',
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  actionButton: {
    minWidth: 100,
  },
});
