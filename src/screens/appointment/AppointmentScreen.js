import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  StyleSheet 
} from 'react-native';

// Import your theme file
import { colors, spacing, typography, radius, shadows } from '../../Constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icons commented out
// import { Calendar, Clock, MapPin, User, CheckCircle, CalendarClock, XCircle, Filter, Search, ChevronDown } from 'lucide-react-native';

const AppointmentsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets()
  // --- START: UPDATED MOCK DATA TO MATCH NEW JSON STRUCTURE ---
  const appointments = [
    {
      _id: "6932d42f68f38e42360d51dd",
      appointmentId: "6932d42fe78e9cfc946204e0",
      patientName: "Test Patient",
      patientPhone: "1234567890",
      encounterId: "APP-1",
      scheduledTime: "09:00 AM", // Using a combined time for display
      visitDate: "2025-08-12",
      status: "BOOKED", // Used for filtering and status badge
      doctorName: "Swaugat", // Used as Facility/Doctor name for mock consistency
      // Add mock avatar and reason/notes since they are required for card rendering
      patientAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900",
      reason: "Routine Follow-up",
      notes: "Patient reports feeling well.",
      appointmentType: "APPOINTMENT",
    },
    {
      _id: "6932d442e78e9cfc946204e1",
      patientName: "Chinmay Roy",
      patientPhone: "7787044454",
      encounterId: "APP-2",
      scheduledTime: "10:55 AM",
      visitDate: "2025-08-12",
      status: "BOOKED",
      doctorName: "Swaugat",
      patientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900",
      reason: "New Consultation",
      notes: "Previous history of arrhythmia.",
      appointmentType: "APPOINTMENT",
    },
    {
      _id: "6936bb3a65e141f3a00cae8c",
      patientName: "Test Patient",
      patientPhone: "1234567890",
      encounterId: "APP-3",
      scheduledTime: "10:40 AM",
      visitDate: "2025-09-12",
      status: "CHECKED_IN",
      doctorName: "Swaugat",
      patientAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900",
      reason: "Blood Pressure Review",
      notes: "Check-in successful, waiting for token.",
      appointmentType: "APPOINTMENT",
    },
    {
      _id: "6936bb7865e141f3a00cae8d",
      patientName: "Test Patient",
      patientPhone: "1234567890",
      encounterId: "APP-1",
      scheduledTime: "10:25 AM",
      visitDate: "2025-10-12",
      status: "CHECKED_IN",
      doctorName: "Swaugat",
      patientAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900",
      reason: "Annual Check-up",
      notes: "Token 691D6B1C40-0004 assigned.",
      appointmentType: "APPOINTMENT",
    },
  ];
  // --- END: UPDATED MOCK DATA ---

  // Filter appointments based on active filter
  const filteredAppointments = appointments.filter(appointment => {
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
    return appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase());
  }).filter(appointment => 
    appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filters for dynamic buttons (derived from unique statuses)
  const statusFilters = [...new Set(appointments.map(a => a.status.toUpperCase()))];
  // Add 'Today' and 'Upcoming' only if they aren't statuses
  if (!statusFilters.includes('TODAY')) statusFilters.push('TODAY');
  if (!statusFilters.includes('UPCOMING')) statusFilters.push('UPCOMING');
  
  // Facilities/Doctors for filter dropdown (using doctorName from new JSON)
  const facilities = [...new Set(appointments.map(a => a.doctorName))];

  // Helper to format filter text for display
  const formatFilterText = (filter) => {
    return filter.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header,{paddingTop:insets.top}]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            {/* <Filter color="white" size={24} /> */}
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          {/* <Search color="white" size={20} /> */}
          <TextInput
            placeholder="Search patients..."
            placeholderTextColor="#FFFFFFAA"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[
                styles.filterChip, 
                activeFilter === 'all' ? styles.filterChipActive : styles.filterChipInactive
              ]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={activeFilter === 'all' ? styles.filterTextActive : styles.filterTextInactive}>
                All
              </Text>
            </TouchableOpacity>
            
            {statusFilters.map((status, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.filterChip, 
                  activeFilter.toUpperCase() === status ? styles.filterChipActive : styles.filterChipInactive
                ]}
                onPress={() => setActiveFilter(status)}
              >
                <Text 
                  style={activeFilter.toUpperCase() === status ? styles.filterTextActive : styles.filterTextInactive}
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
                  activeFilter === facility ? styles.filterChipActive : styles.filterChipInactive
                ]}
                onPress={() => setActiveFilter(facility)}
              >
                <Text 
                  style={activeFilter === facility ? styles.filterTextActive : styles.filterTextInactive} 
                  numberOfLines={1}
                >
                  {facility}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Appointments List */}
      <ScrollView style={styles.contentScroll}>
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            {/* <User color="#9CA3AF" size={48} /> */}
            <Text style={styles.emptyTitle}>No appointments found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
          </View>
        ) : (
          filteredAppointments.map((appointment) => (
            <View 
              key={appointment.appointmentId} 
              style={[styles.card, shadows.sm]} 
            >
              {/* Appointment Header */}
              <View style={styles.cardHeader}>
                <View style={styles.dateRow}>
                  {/* <Calendar color={colors.primary} size={18} /> */}
                  {/* USING visitDate */}
                  <Text style={styles.dateText}>{appointment.visitDate}</Text> 
                </View>
                <View style={[
                  styles.statusBadge,
                  // Simplified status mapping: Confirmed or Pending/Other
                  appointment.status === 'CHECKED_IN' ? styles.statusConfirmed : styles.statusPending
                ]}>
                  <Text style={[
                    styles.statusText,
                    appointment.status === 'CHECKED_IN' ? styles.statusTextConfirmed : styles.statusTextPending
                  ]}>
                    {formatFilterText(appointment.status)}
                  </Text>
                </View>
              </View>
              
              {/* Patient Info */}
              <View style={styles.cardBody}>
                <View style={styles.patientRow}>
                  <Image 
                    // Using a mock avatar as it's not provided in the new JSON
                    source={{ uri: appointment.patientAvatar || "https://via.placeholder.com/64" }} 
                    style={styles.avatar}
                  />
                  <View style={styles.patientInfo}>
                    {/* USING patientName */}
                    <Text style={styles.patientName}>{appointment.patientName}</Text> 
                    <View style={styles.infoRow}>
                      {/* <MapPin color={colors.textTertiary} size={14} /> */}
                      {/* USING doctorName as facility */}
                      <Text style={styles.infoText}>Doctor: {appointment.doctorName}</Text> 
                    </View>
                    <View style={styles.infoRow}>
                      {/* <Clock color={colors.textTertiary} size={14} /> */}
                      {/* USING scheduledTime */}
                      <Text style={styles.infoText}>Time: {appointment.scheduledTime}</Text> 
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailsContainer}>
                  <Text style={styles.label}>Encounter ID:</Text>
                  <Text style={styles.value}>{appointment.encounterId}</Text>
                  
                  {/* Using original reason/notes for context, since new JSON lacks them */}
                  <Text style={[styles.label, styles.marginTop]}>Reason:</Text>
                  <Text style={styles.value}>{appointment.reason || "N/A"}</Text> 

                  <View style={styles.marginTop}>
                    <Text style={styles.label}>Type:</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{appointment.appointmentType}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionButton, styles.actionBtnSuccess]}>
                    {/* <CheckCircle color="#4CAF50" size={20} /> */}
                    <Text style={styles.actionBtnTextSuccess}>Check-in</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionButton, styles.actionBtnInfo]}>
                    {/* <CalendarClock color={colors.primary} size={20} /> */}
                    <Text style={styles.actionBtnTextInfo}>Reschedule</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionButton, styles.actionBtnError]}>
                    {/* <XCircle color={colors.error} size={20} /> */}
                    <Text style={styles.actionBtnTextError}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

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
    marginTop: 48, 
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
  avatar: {
    width: 64, 
    height: 64, 
    borderRadius: radius.full,
  },
  patientInfo: {
    marginLeft: spacing.md,
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
});

export default AppointmentsScreen;