import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Calendar, Search, AlertCircle } from 'lucide-react-native';
import { colors, spacing, typography, radius, shadows } from '../../../Constants/theme';

const { width } = Dimensions.get('window');

const EmptyState = ({ 
  title = "No appointments found", 
  description = "Try adjusting your filters or search criteria to find what you're looking for.",
  onAction,
  actionLabel,
  icon: Icon = Calendar,
  type = 'default' // 'search', 'error', 'default'
}) => {
  
  // Choose icon based on type if not provided
  let DisplayIcon = Icon;
  if (type === 'search') DisplayIcon = Search;
  if (type === 'error') DisplayIcon = AlertCircle;

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Animated-looking Icon Container */}
        <View style={styles.iconWrapper}>
          <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
              <DisplayIcon size={40} color={colors.primary} strokeWidth={2.5} />
            </View>
          </View>
          
          {/* Decorative Elements */}
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {onAction && actionLabel && (
          <TouchableOpacity 
            style={[styles.button, shadows.sm]} 
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconWrapper: {
    marginBottom: spacing.xl,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  circleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6F0FF',
  },
  circleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
  },
  dot: {
    position: 'absolute',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  dot1: {
    width: 12,
    height: 12,
    top: 10,
    right: 20,
  },
  dot2: {
    width: 8,
    height: 8,
    bottom: 20,
    left: 15,
    opacity: 0.15,
  },
  dot3: {
    width: 6,
    height: 6,
    top: 40,
    left: 10,
    opacity: 0.1,
  },
  title: {
    ...typography.h3,
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    ...typography.bodyBold,
    fontWeight: '600',
  },
});

export default EmptyState;
