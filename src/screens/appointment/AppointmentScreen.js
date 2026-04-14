import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Platform
} from 'react-native';

// Import your theme file
import {
  colors,
  spacing,
  typography,
  radius,
} from '../../Constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icons commented out
import {
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
} from 'lucide-react-native';
import { useVisitCompleteMutation, useVisitListQuery } from '../../hooks/useEmr';
import CheckInModal from './components/CheckInModal';
import RouterConstants from '../../Constants/RouterConstants';
import { useNavigation } from '@react-navigation/native';
import EmptyState from './components/EmptyState';
import DateRangeFilter from '../../components/DateRangeFilter';
const AppointmentsScreen = () => {
  const navigation = useNavigation()
  const [visible, setVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Date Filter State
  const [dateFilter, setDateFilter] = useState('TODAY'); // TODAY, YESTERDAY, TOMORROW, CUSTOM
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' }); // YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  // Calculate Date Range based on filter
  const getDateRange = useCallback(() => {
    const today = new Date();
    
    switch (dateFilter) {
      case 'TODAY':
        return { from: formatDate(today), to: formatDate(today) };
      case 'YESTERDAY':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: formatDate(yesterday), to: formatDate(yesterday) };
      case 'TOMORROW':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { from: formatDate(tomorrow), to: formatDate(tomorrow) };
      case 'CUSTOM':
        return { 
          from: customDateRange.start || formatDate(today), 
          to: customDateRange.end || formatDate(today) 
        };
      default:
        return { from: formatDate(today), to: formatDate(today) };
    }
  }, [dateFilter, customDateRange]);

  const { from: fromDate, to: toDate } = getDateRange();

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useVisitListQuery({
    from: fromDate, 
    to: toDate,
  });



  const {mutate,data:confirmationRes ,isLoading:confirmationLoading ,error:confirmationError,  } = useVisitCompleteMutation()
 
  const insets = useSafeAreaInsets();
 
 const resetFilters = () => {
    setActiveFilter('all');
    setDateFilter('TODAY');
    setCustomDateRange({ start: '', end: '' });
    setSearchQuery('');
 };

  const handleCompleteVisit =(query)=>{
    console.log('callled',query);
    
    mutate({
      "slotId": query?.slotId,
      "appointmentId": query?.appointmentId,
      "registrationId": query?.registrationId,
      "notes": query?.drNote
    })
  }

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Transform API data to match expected format or use mock data
  const appointments = React.useMemo(() => {
    if (apiData?.data?.data && Array.isArray(apiData?.data?.data)) {
      return apiData?.data?.data
        .filter(visit => visit.status === 'CHECKED_IN')
        .map(visit => ({
          patientAvatar: `https://images.unsplash.com/photo-${
            Math.random() > 0.5
              ? '1527980965255-d3b416303d12'
              : '1494790108377-be9c29b29330'
          }?w=900`,
          ...visit
        }));
    }
    return [];
  }, [apiData]);

  // Filter appointments based on active filter
  const filteredAppointments = appointments
    .filter(appointment => {
      // Standardize filter values to uppercase for matching (e.g., BOOKED)
      const normalizedStatus = appointment.status.toUpperCase();

      if (activeFilter === 'all') return true;

      // Filter by status (BOOKED, CHECKED_IN, etc.)
      if (activeFilter.toUpperCase() === normalizedStatus) return true;

      if (activeFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        return appointment.visitDate === today;
      }
      if (activeFilter === 'upcoming') {
        const today = new Date();
        const appointmentDate = new Date(appointment.visitDate);
        // Checking if the appointment date is today or in the future
        return appointmentDate >= new Date(today.setHours(0, 0, 0, 0));
      }
      // Search by Patient Name
      return appointment.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .filter(appointment =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  // Filters for dynamic buttons (derived from unique statuses)
  const statusFilters = [
    ...new Set(appointments.map(a => a.status.toUpperCase())),
  ];
  // Add 'Today' and 'Upcoming' only if they aren't statuses
  if (!statusFilters.includes('TODAY')) statusFilters.push('TODAY');
  if (!statusFilters.includes('UPCOMING')) statusFilters.push('UPCOMING');

  // Facilities/Doctors for filter dropdown (using doctorName from new JSON)
  const facilities = [];

  // Helper to format filter text for display
  const formatFilterText = filter => {
    return filter
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="white" size={20} />
          <TextInput
            placeholder="Search patients..."
            placeholderTextColor="#FFFFFFAA"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      {(visible && selectedAppointment) && (
        <CheckInModal
          visible={visible}
          onClose={() => {
            setVisible(false), setSelectedAppointment('');
          }}
          onConfirm={handleCompleteVisit}
          data={selectedAppointment}
        />
      )}
      
      {/* Date Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
             <DateRangeFilter
                initialFilterType={dateFilter.toLowerCase()}
                initialFromDate={new Date(customDateRange.start || getDateRange().from)}
                initialToDate={new Date(customDateRange.end || getDateRange().to)}
                allowedFilters={['today', 'tomorrow', 'yesterday', 'custom']}
                onApply={(start, end, filterType) => {
                    setDateFilter(filterType.toUpperCase());
                    if (filterType === 'custom') {
                        setCustomDateRange({ start: formatDate(start), end: formatDate(end) });
                    }
                }}
             />
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'all'
                  ? styles.filterChipActive
                  : styles.filterChipInactive,
              ]}
              onPress={() => setActiveFilter('all')}
            >
              <Text
                style={
                  activeFilter === 'all'
                    ? styles.filterTextActive
                    : styles.filterTextInactive
                }
              >
                All
              </Text>
            </TouchableOpacity>

            {statusFilters.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  activeFilter.toUpperCase() === status
                    ? styles.filterChipActive
                    : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(status)}
              >
                <Text
                  style={
                    activeFilter.toUpperCase() === status
                      ? styles.filterTextActive
                      : styles.filterTextInactive
                  }
                  numberOfLines={1}
                >
                  {formatFilterText(status)}
                </Text>
              </TouchableOpacity>
            ))}

            {facilities.map((facility, index) => (
              <TouchableOpacity
                key={`facility-${index}`}
                style={[
                  styles.filterChip,
                  activeFilter === facility
                    ? styles.filterChipActive
                    : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(facility)}
              >
                <Text
                  style={
                    activeFilter === facility
                      ? styles.filterTextActive
                      : styles.filterTextInactive
                  }
                  numberOfLines={1}
                >
                  {facility}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView> */}
        </View>
      )}

      {/* Appointments List */}
      <ScrollView 
        style={styles.contentScroll}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={{flexGrow: 1, paddingBottom: 120}}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading appointments...</Text>
          </View>
        ) : error ? (
          <EmptyState 
            title="Error loading appointments"
            description={error.message || 'Please try again later'}
            actionLabel="Try Again"
            onAction={onRefresh}
            type="error"
          />
  ) : filteredAppointments.length === 0 ? (
          <EmptyState 
            title="No Appointments Found"
            description="We couldn't find any appointments matching your current filters."
            // actionLabel="Reset Filters"
            // onAction={resetFilters}
            type="search"
          />
        ) : (
          filteredAppointments?.map(appointment => (
            <View key={appointment?._id} style={styles.modernCard}>
  {/* Status Accent Bar */}
  <View 
    style={[
      styles.statusAccent, 
      { backgroundColor: appointment.status === 'CHECKED_IN' ? '#10B981' : '#F59E0B' }
    ]} 
  />

  <TouchableOpacity 
    onPress={() => navigation.navigate(RouterConstants.EmrGenerationScreen, { patientData: appointment })}
    style={styles.cardContent}
    activeOpacity={0.7}
  >
    {/* Top Row: Date & Status */}
    <View style={styles.headerRow}>
      <View style={styles.dateTimeBadge}>
        <Calendar color={colors.primary} size={14} />
        <Text style={styles.headerDateText}>{appointment.visitDate}</Text>
        <View style={styles.dotSeparator} />
        <Clock color={colors.primary} size={14} />
        <Text style={styles.headerDateText}>{appointment.scheduledTime}</Text>
      </View>
      
      <View style={[
        styles.statusPill,
        appointment.status === 'CHECKED_IN' ? styles.pillSuccess : styles.pillWarning
      ]}>
        <Text style={[
          styles.statusPillText,
          appointment.status === 'CHECKED_IN' ? styles.textSuccess : styles.textWarning
        ]}>
          {formatFilterText(appointment.status)}
        </Text>
      </View>
    </View>

    {/* Patient Profile Row */}
    <View style={styles.profileSection}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {appointment.patientName?.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.mainInfo}>
        <Text style={styles.patientNameModern}>{appointment.patientName}</Text>
        <View style={styles.doctorRow}>
          <View style={styles.iconCircle}>
             <MapPin color={colors.primary} size={12} />
          </View>
          <Text style={styles.doctorNameText}>{appointment.doctorName}</Text>
        </View>
      </View>
    </View>

    {/* Metadata Grid */}
    <View style={styles.metaGrid}>
      <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>ENCOUNTER ID</Text>
        <Text style={styles.metaValue}>#{appointment.encounterId}</Text>
      </View>
      <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>PATIENT DETAILS</Text>
        <Text style={styles.metaValue}>{appointment?.patientAge} • {appointment?.patientGender}</Text>
      </View>
      <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>APPOINTMENT TYPE</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>{appointment.visitType}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
</View>
          ))
        )}
      </ScrollView>


    </View>
  );
};
      // {/* Custom Date Modal */}
      // <>
      // {showCustomDateModal && (
      //   <View style={styles.modalOverlay}>
      //     {showPicker.show && (
      //               <DateTimePicker
      //                   value={new Date(showPicker.type === 'start' ? (tempDateRange.start || new Date()) : (tempDateRange.end || new Date()))}
      //                   mode="date"
      //                   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      //                   onChange={onDateChange}
      //                   minimumDate={showPicker.type === 'end' && tempDateRange.start ? new Date(tempDateRange.start) : undefined}
      //                   maximumDate={showPicker.type === 'start' && tempDateRange.end ? new Date(tempDateRange.end) : undefined}
      //               />
      //       )}
      //       <View style={styles.dateModal}>
      //           <Text style={styles.modalTitle}>Select Date Range</Text>
                
      //           <Text style={styles.modalLabel}>Start Date</Text>
      //           <TouchableOpacity 
      //               style={styles.datePickerButton} 
      //               onPress={() => setShowPicker({ show: true, mode: 'date', type: 'start' })}
      //           >
      //               <Text style={styles.datePickerText}>{tempDateRange.start || 'Select Start Date'}</Text>
      //               <Calendar size={20} color={colors.gray500} />
      //           </TouchableOpacity>

      //            <Text style={styles.modalLabel}>End Date</Text>
      //            <TouchableOpacity 
      //               style={styles.datePickerButton} 
      //               onPress={() => setShowPicker({ show: true, mode: 'date', type: 'end' })}
      //           >
      //               <Text style={styles.datePickerText}>{tempDateRange.end || 'Select End Date'}</Text>
      //               <Calendar size={20} color={colors.gray500} />
      //           </TouchableOpacity>

      //           <View style={styles.modalActions}>
      //               <TouchableOpacity onPress={() => setShowCustomDateModal(false)} style={styles.modalCancel}>
      //                   <Text style={styles.modalCancelText}>Cancel</Text>
      //               </TouchableOpacity>
      //               <TouchableOpacity onPress={handleCustomDateSubmit} style={styles.modalConfirm}>
      //                   <Text style={styles.modalConfirmText}>Apply</Text>
      //               </TouchableOpacity>
      //           </View>
      //           {/* Close button for iOS Picker if needed, or just rely on Apply/Cancel to close modal which is fine for inline */}
      //       </View>
      //   </View>
      // )}
      // </>

// --- STYLES REMAINING UNCHANGED ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.white,
    ...typography.h3,
    fontWeight: '700',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    padding: spacing.sm,
  },
  searchContainer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.white,
    height: 40,
    // textAlign:'center'
  },

  // Filters
  filtersContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  filterChip: {
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
  },
  filterChipInactive: {
    backgroundColor: colors.gray100,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  filterTextInactive: {
    color: colors.gray500,
    fontWeight: '500',
  },

  // List
  contentScroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 48,
  },
  emptyTitle: {
    color: colors.gray500,
    fontSize: 18,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    color: colors.gray400,
    marginTop: spacing.sm,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.gray100,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: spacing.sm,
    ...typography.bodyBold,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7', // CHECKED_IN
  },
  statusPending: {
    backgroundColor: '#FEF9C3', // BOOKED/Other
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextConfirmed: {
    color: '#166534',
  },
  statusTextPending: {
    color: '#854D0E',
  },

  // Card Body
  cardBody: {
    padding: spacing.md,
  },
  patientRow: {
    flexDirection: 'row',
  },
  // avatar: {   // REMOVED
  //   width: 64,
  //   height: 64,
  //   borderRadius: radius.full,
  // },
  patientInfo: {
    // marginLeft: spacing.md, // REMOVED MARGIN
    flex: 1,
  },
  patientName: {
    ...typography.h4,
    fontSize: 18,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    color: colors.gray600,
    fontSize: 14,
    marginLeft: 4,
  },
  detailsContainer: {
    marginTop: spacing.md,
  },
  label: {
    fontWeight: '600',
    color: colors.text,
  },
  value: {
    color: colors.gray600,
  },
  marginTop: {
    marginTop: spacing.sm,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  typeText: {
    color: colors.primaryDark,
    fontSize: 14,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  actionBtnSuccess: {
    backgroundColor: '#DCFCE7',
  },
  actionBtnInfo: {
    backgroundColor: colors.primaryLight,
  },
  actionBtnError: {
    backgroundColor: '#FEE2E2',
  },
  actionBtnTextSuccess: {
    color: '#166534',
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  actionBtnTextInfo: {
    color: colors.primaryDark,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  actionBtnTextError: {
    color: '#991B1B',
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dateModal: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.lg,
    width: '85%'
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  modalLabel: {
    ...typography.bodyBold,
    marginBottom: 4,
    marginTop: 8
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 16
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.gray100
  },
  datePickerText: {
    fontSize: 16,
    color: colors.text
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems:'center',
    marginTop: spacing.lg,
    gap: 18
  },
  modalCancel: {
    padding: spacing.sm,
  },
  modalCancelText: {
    color: colors.gray500,
    fontWeight: '600'
  },
  modalConfirm: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md
  },
  modalConfirmText: {
    color: colors.white,
    fontWeight: '600'
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    // Elegant soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusAccent: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 4,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillSuccess: { backgroundColor: '#ECFDF5' },
  pillWarning: { backgroundColor: '#FFFBEB' },
  statusPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  textSuccess: { color: '#059669' },
  textWarning: { color: '#D97706' },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  avatarText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 18,
  },
  mainInfo: {
    marginLeft: 14,
    flex: 1,
  },
  patientNameModern: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorNameText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    gap: 12,
  },
  metaItem: {
    minWidth: '45%',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  }
});

export default AppointmentsScreen;
