import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../Constants/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[typography.bodyBold, styles[`text_${variant}`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  button_primary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  button_secondary: {
    backgroundColor: colors.primaryLight,
  },
  button_outline: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  button_danger: {
    backgroundColor: colors.error,
    ...shadows.md,
  },

  button_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  button_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  button_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  text_primary: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.primary,
  },
  text_outline: {
    color: colors.primary,
  },
  text_danger: {
    color: colors.white,
  },

  disabled: {
    opacity: 0.5,
  },
});
    