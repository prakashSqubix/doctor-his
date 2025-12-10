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
import { useSelectTenantMutation } from '../../hooks/useAuth';
import RouterConstants from '../../Constants/RouterConstants';

export default function TenantSelectionScreen() {
  const navigation = useNavigation();
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  
  const { 
    availableTenants, 
    tenantSelectionToken, 
    userId 
  } = useSelector((state) => state.loginFlow);

  const selectTenantMutation = useSelectTenantMutation();
console.log('userid',userId);

const handleContinue = async () => {
  if (!selectedTenantId) return;

  try {
    const data = await selectTenantMutation.mutateAsync({
      tenantSelectionToken,
      tenantId: selectedTenantId,
      userId,
    });

    const responseData = data?.data;

    // Single facility case
    if (responseData?.accessToken && responseData?.facility) {
      navigation.reset({
        index: 0,
        routes: [{ name: RouterConstants.DashboardScreen }],
      });
      return;
    }

    // Multiple facility case
    if (responseData?.facilitySelectionToken && responseData?.facilities) {
      navigation.navigate(RouterConstants.FacilitySelectionScreen);
      return;
    }

    Alert.alert("Error", "Unexpected response from server");

  } catch (error) {
    Alert.alert("Error", error.message || "Failed to select tenant");
  }
};
const tenantList = availableTenants?.filter(item =>
    item.roles?.some(role => role.roleName === 'DOCTOR')
  )
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[typography.h2, styles.title]}>Select Your Tenant</Text>
        <Text style={[typography.body, styles.subtitle]}>
          Choose where you work today
        </Text>
      </View>

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {tenantList?.map((tenant) => (
          <TouchableOpacity
            key={tenant.tenantId}
            style={[
              styles.tenantCard,
              selectedTenantId === tenant.tenantId && styles.tenantCardSelected,
            ]}
            onPress={() => setSelectedTenantId(tenant.tenantId)}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconWrapper,
                selectedTenantId === tenant.tenantId && styles.iconWrapperSelected
              ]}>
                <BuildingIcon 
                  fill={selectedTenantId === tenant.tenantId ? colors.primary : colors.textSecondary}
                />
              </View>

              <View style={styles.textWrapper}>
                <Text
                  style={[
                    typography.bodyBold,
                    {
                      color:
                        selectedTenantId === tenant.tenantId
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  {tenant.name}
                </Text>

                {tenant.description ? (
                  <Text
                    style={[
                      typography.bodySm,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {tenant.description}
                  </Text>
                ) : null}

                {tenant.address ? (
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textTertiary },
                    ]}
                    numberOfLines={1}
                  >
                    {tenant.address}
                  </Text>
                ) : null}
              </View>
            </View>

            {selectedTenantId === tenant.tenantId && (
              <View style={styles.checkIcon}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedTenantId}
          loading={selectTenantMutation.isPending}
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
  tenantCard: {
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
  tenantCardSelected: {
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
  textWrapper: {
    flex: 1,
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
});
