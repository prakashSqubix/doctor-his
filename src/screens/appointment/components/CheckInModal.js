import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../../../Constants/theme';

const CheckInModal = ({
  visible = false,
  onClose = () => {},
  onConfirm = (note) => {},
  title = 'Confirm',
  data,
  subtitle = '',
  showNote = true,
  initialNote = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmDisabled = false,
  confirmLoading = false,
  placeholder = 'Add a note (optional)',
  maxLength = 500,
  // optional style overrides
  containerStyle,
  contentStyle,
  inputStyle,
  confirmButtonStyle,
  cancelButtonStyle,
}) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    // reset note when modal opens (optional)
    if (visible) setNote(initialNote ?? '');
  }, [visible, initialNote]);

  const handleConfirm = () => {
    // pass note (empty string if not used)
    onConfirm({...data,drNote:note});
  };
console.log('selcted data',data);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.backdrop]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.touchBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.container, containerStyle]}>
            <View style={[styles.content, contentStyle]}>
              <Text style={[typography.h4, styles.title]} accessibilityRole="header">
                {data?.patientName||'Patient'}
              </Text>

              {subtitle ? <Text style={[typography.bodySm, styles.subtitle]}>{subtitle}</Text> : null}

              {showNote ? (
                <TextInput
                  style={[styles.input, inputStyle]}
                  value={note}
                  onChangeText={(t) => setNote(t)}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  maxLength={maxLength}
                  textAlignVertical="top"
                  accessible
                  accessibilityLabel="Note input"
                />
              ) : null}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.cancelButton, cancelButtonStyle]}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={[styles.cancelText]}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    confirmDisabled || confirmLoading ? styles.confirmButtonDisabled : null,
                    confirmButtonStyle,
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  disabled={confirmDisabled || confirmLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm"
                >
                  {confirmLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.white}
                      style={{ marginHorizontal: spacing.sm }}
                    />
                  ) : null}
                  <Text style={[styles.confirmText]}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.6)', // semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  touchBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '100%',
    maxWidth: 720,
    paddingHorizontal: spacing.sm,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.xs,
    ...typography.h4,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    ...typography.bodySm,
  },
  input: {
    minHeight: 96,
    maxHeight: 240,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.text,
    ...typography.body,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm, // Android may ignore gap, keep spacing using margin
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    ...typography.bodyBold,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  confirmText: {
    color: colors.white,
    ...typography.bodyBold,
  },
});

export default CheckInModal;
