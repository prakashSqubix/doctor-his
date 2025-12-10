import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons'; // ❌ ICONS COMMENTED
import { colors, spacing, typography, radius } from '../Constants/theme';

export default function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  error,
  multiline = false,
  numberOfLines = 1,
  style,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[typography.bodySmBold, styles.label]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        <RNTextInput
          style={[typography.body, styles.input]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />

        {/* Password Toggle Icon Removed */}
        {/* <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.iconButton}
        >
          <MaterialIcons
            name={showPassword ? 'visibility' : 'visibility-off'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity> */}
      </View>

      {error && (
        <Text style={[typography.caption, styles.error]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    paddingHorizontal: spacing.md - 0.5,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.surfaceVariant,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  iconButton: {
    padding: spacing.md,
    marginRight: -spacing.md,
  },
  error: {
    color: colors.error,
    marginTop: spacing.xs,
  },
});
