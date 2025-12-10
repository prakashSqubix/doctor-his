import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Button } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../Constants/theme';
import { BuildingIcon } from '../../../assets/svg';
import { useSelectFacilityMutation } from '../../hooks/useAuth';
import RouterConstants from '../../Constants/RouterConstants';

export default function FacilitySelectionScreen() {
  const navigation = useNavigation();
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  
  const { 
    availableFacilities, 
    facilitySelectionToken, 
    userId, 
    selectedTenantId 
  } = useSelector((state) => state.loginFlow);
console.log('selectedTenantId,userId',userId,selectedTenantId);

  const selectFacilityMutation = useSelectFacilityMutation();

  const handleContinue = async () => {
    if (!selectedFacilityId) return;

    try {
      const result = await selectFacilityMutation.mutateAsync({
        facilitySelectionToken,
        userId,
        tenantId: selectedTenantId,
        facilityId: selectedFacilityId,
      });

      if (result.type === 'NAVIGATE_TO_DASHBOARD') {
        navigation.reset({
          index: 0,
          routes: [{ name: RouterConstants.DashboardScreen }],
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to select facility');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[typography.h2, styles.title]}>Select Your Facility</Text>
        <Text style={[typography.body, styles.subtitle]}>
          Choose your workplace facility
        </Text>
      </View>

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {availableFacilities && availableFacilities.length > 0 ? (
          availableFacilities.map((facility) => (
          <TouchableOpacity
            key={facility.facilityId}
            style={[
              styles.facilityCard,
              selectedFacilityId === facility.facilityId && styles.facilityCardSelected,
            ]}
            onPress={() => setSelectedFacilityId(facility.facilityId)}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconWrapper,
                selectedFacilityId === facility.facilityId && styles.iconWrapperSelected
              ]}>
                <BuildingIcon 
                  fill={selectedFacilityId === facility.facilityId ? colors.primary : colors.textSecondary}
                />
              </View>

              <View style={styles.textWrapper}>
                <Text
                  style={[
                    typography.bodyBold,
                    {
                      color:
                        selectedFacilityId === facility.facilityId
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  {facility.name}
                </Text>

                {facility.address && (
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textTertiary },
                    ]}
                    numberOfLines={1}
                  >
                    {facility.address}
                  </Text>
                )}
              </View>
            </View>

            {selectedFacilityId === facility.facilityId && (
              <View style={styles.checkIcon}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[typography.body, styles.emptyText]}>
              No facilities available
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedFacilityId}
          loading={selectFacilityMutation.isPending}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  facilityCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryLight,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconWrapperSelected: {
    backgroundColor: colors.primaryLight,
  },
  textWrapper: {
    flex: 1,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});