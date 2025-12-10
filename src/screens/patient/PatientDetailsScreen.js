import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet 
} from 'react-native';

// Navigation/Router logic commented out
// import { useRouter } from 'expo-router'; 

// Import your theme file
import { colors, spacing, typography, radius, shadows } from '../../Constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icons commented out
/* import { 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  Pill, 
  AlertTriangle, 
  FileText, 
  Plus, 
  ChevronRight,
  Clock,
  User
} from 'lucide-react-native';
*/

const PatientDetailsScreen = () => {
  // const router = useRouter(); // Router commented out
  const [activeTab, setActiveTab] = useState('overview');
 const inset = useSafeAreaInsets()
  // Mock patient data
  const patientData = {
    id: 'PT-12345',
    name: 'Sarah Johnson',
    age: 32,
    gender: 'Female',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Husband',
      phone: '+1 (555) 987-6543'
    }
  };

  // Mock medical history
  const medicalHistory = [
    { id: 1, condition: 'Hypertension', diagnosed: '2019', status: 'Managed' },
    { id: 2, condition: 'Seasonal Allergies', diagnosed: '2015', status: 'Active' },
    { id: 3, condition: 'Type 2 Diabetes', diagnosed: '2021', status: 'Managed' },
    { id: 4, condition: 'Asthma', diagnosed: '2010', status: 'Inactive' }
  ];

  // Mock current medications
  const medications = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribed: 'Dr. Williams' },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribed: 'Dr. Williams' },
    { id: 3, name: 'Albuterol Inhaler', dosage: '2 puffs', frequency: 'As needed', prescribed: 'Dr. Williams' }
  ];

  // Mock allergies
  const allergies = [
    { id: 1, allergen: 'Penicillin', reaction: 'Skin rash', severity: 'Moderate' },
    { id: 2, allergen: 'Shellfish', reaction: 'Anaphylaxis', severity: 'Severe' },
    { id: 3, allergen: 'Latex', reaction: 'Skin irritation', severity: 'Mild' }
  ];

  // Mock appointment history
  const appointmentHistory = [
    { id: 1, date: '2023-05-15', time: '10:30 AM', reason: 'Annual Physical', doctor: 'Dr. Williams', status: 'Completed' },
    { id: 2, date: '2023-03-22', time: '2:15 PM', reason: 'Follow-up Visit', doctor: 'Dr. Williams', status: 'Completed' },
    { id: 3, date: '2023-01-10', time: '11:00 AM', reason: 'Lab Results Review', doctor: 'Dr. Williams', status: 'Completed' },
    { id: 4, date: '2022-11-05', time: '9:45 AM', reason: 'Flu Shot', doctor: 'Dr. Peterson', status: 'Completed' }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return styles.statusChipActive;
      case 'Managed':
        return styles.statusChipManaged;
      default:
        return styles.statusChipInactive;
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'Active':
        return styles.statusTextActive;
      case 'Managed':
        return styles.statusTextManaged;
      default:
        return styles.statusTextInactive;
    }
  };

  const getAllergySeverityStyle = (severity) => {
    switch (severity) {
      case 'Severe':
        return styles.severityChipSevere;
      case 'Moderate':
        return styles.severityChipModerate;
      case 'Mild':
        return styles.severityChipMild;
      default:
        return styles.statusChipInactive;
    }
  };

  const getAllergySeverityTextStyle = (severity) => {
    switch (severity) {
      case 'Severe':
        return styles.severityTextSevere;
      case 'Moderate':
        return styles.severityTextModerate;
      case 'Mild':
        return styles.severityTextMild;
      default:
        return styles.statusTextInactive;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header,{paddingTop:inset.top +20}]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => {/* router.back() */}}>
            {/* <ChevronRight size={28} color="white" style={styles.backIcon} /> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <View style={styles.headerSpacer} /> {/* Spacer for alignment */}
        </View>
        
        {/* Patient Info Card */}
        <View style={[styles.patientInfoCard, shadows.md]}>
          <View style={styles.patientInfoRow}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.patientDetails}>
              <Text style={styles.patientName}>{patientData.name}</Text>
              <Text style={styles.patientMeta}>{patientData.age} years, {patientData.gender}</Text>
            </View>
          </View>
          
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              {/* <Phone size={16} color={colors.gray600} /> */}
              <Text style={styles.contactText}>{patientData.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              {/* <MapPin size={16} color={colors.gray600} /> */}
              <Text style={styles.contactText}>NYC General Hospital</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={[styles.quickActionsContainer, shadows.md]}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {/* router.push('/emr-generation') */}}
        >
          <View style={[styles.actionIconWrapper, styles.actionNewEMR]}>
            {/* <FileText size={24} color={colors.primary} /> */}
          </View>
          <Text style={styles.actionText}>New EMR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {/* router.push('/prescription-generation') */}}
        >
          <View style={[styles.actionIconWrapper, styles.actionPrescription]}>
            {/* <Pill size={24} color={colors.success} /> */}
          </View>
          <Text style={styles.actionText}>Prescription</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIconWrapper, styles.actionSchedule]}>
            {/* <Calendar size={24} color={colors.purple} /> */}
          </View>
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIconWrapper, styles.actionContact]}>
            {/* <Phone size={24} color={colors.warning} /> */}
          </View>
          <Text style={styles.actionText}>Contact</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={[styles.tabContainer, shadows.sm]}>
        {['overview', 'history', 'medications', 'allergies'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab ? styles.tabTextActive : styles.tabTextInactive
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Content */}
      <ScrollView style={styles.contentScroll}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* Personal Information */}
            <View style={[styles.card, shadows.sm]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                <TouchableOpacity>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailGroup}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Patient ID:</Text>
                  <Text style={styles.detailValue}>{patientData.id}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailValue}>{patientData.address}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Emergency:</Text>
                  <View style={styles.detailValue}>
                    <Text style={styles.detailValueBold}>{patientData.emergencyContact.name}</Text>
                    <Text style={styles.detailMeta}>{patientData.emergencyContact.relationship} • {patientData.emergencyContact.phone}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Upcoming Appointments */}
            <View style={[styles.card, shadows.sm]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Upcoming Appointments</Text>
                <TouchableOpacity>
                  <Text style={styles.editText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.upcomingAppointment}>
                <View style={styles.appointmentDateRow}>
                  <View style={styles.appointmentMarker} />
                  {/* <Calendar size={12} color="white" style={styles.appointmentIcon} /> */}
                  <Text style={styles.appointmentDateText}>June 15, 2023</Text>
                </View>
                <Text style={styles.appointmentReason}>Annual Physical Checkup</Text>
                <Text style={styles.appointmentMeta}>Dr. Williams • 10:30 AM</Text>
              </View>
            </View>
            
            {/* Recent Activity */}
            <View style={[styles.card, shadows.sm]}>
              <Text style={styles.cardTitle}>Recent Activity</Text>
              
              <View style={styles.activityGroup}>
                <View style={styles.activityRow}>
                  <View style={[styles.activityIconWrapper, styles.activityEMR]}>
                    {/* <FileText size={16} color={colors.successDark} /> */}
                  </View>
                  <View>
                    <Text style={styles.activityTitle}>New EMR Created</Text>
                    <Text style={styles.activityMeta}>June 5, 2023 • Dr. Williams</Text>
                  </View>
                </View>
                
                <View style={styles.activityRow}>
                  <View style={[styles.activityIconWrapper, styles.activityPrescription]}>
                    {/* <Pill size={16} color={colors.primary} /> */}
                  </View>
                  <View>
                    <Text style={styles.activityTitle}>Prescription Renewed</Text>
                    <Text style={styles.activityMeta}>May 28, 2023 • Metformin</Text>
                  </View>
                </View>
                
                <View style={styles.activityRow}>
                  <View style={[styles.activityIconWrapper, styles.activitySchedule]}>
                    {/* <Calendar size={16} color={colors.purple} /> */}
                  </View>
                  <View>
                    <Text style={styles.activityTitle}>Appointment Scheduled</Text>
                    <Text style={styles.activityMeta}>May 20, 2023 • Annual Physical</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        
        {/* Medical History Tab */}
        {activeTab === 'history' && (
          <View>
            <View style={[styles.listCard, shadows.sm]}>
              <View style={styles.listHeader}>
                <Text style={styles.cardTitle}>Medical History</Text>
                <Text style={styles.listSubTitle}>Conditions and diagnoses</Text>
              </View>
              
              <View style={styles.listContent}>
                {medicalHistory.map((condition, index) => (
                  <View 
                    key={condition.id} 
                    style={[styles.listItem, index < medicalHistory.length - 1 && styles.listItemDivider]}
                  >
                    <View style={styles.listItemRow}>
                      <Text style={styles.listItemTitle}>{condition.condition}</Text>
                      <View style={[styles.statusChip, getStatusStyle(condition.status)]}>
                        <Text style={[styles.statusChipText, getStatusTextStyle(condition.status)]}>
                          {condition.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.listItemMeta}>Diagnosed: {condition.diagnosed}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={[styles.listCard, shadows.sm, styles.marginTopMd]}>
              <View style={styles.listHeader}>
                <Text style={styles.cardTitle}>Appointment History</Text>
                <Text style={styles.listSubTitle}>Past visits and consultations</Text>
              </View>
              
              <View style={styles.listContent}>
                {appointmentHistory.map((appointment, index) => (
                  <View 
                    key={appointment.id} 
                    style={[styles.listItem, index < appointmentHistory.length - 1 && styles.listItemDivider]}
                  >
                    <View style={styles.listItemRow}>
                      <Text style={styles.listItemTitle}>{appointment.reason}</Text>
                      <Text style={styles.listItemMeta}>{appointment.date}</Text>
                    </View>
                    <View style={styles.appointmentDetailRow}>
                      {/* <Clock size={14} color={colors.gray600} style={styles.detailIcon} /> */}
                      <Text style={styles.listItemText}>{appointment.time}</Text>
                      {/* <User size={14} color={colors.gray600} style={styles.detailIcon} /> */}
                      <Text style={styles.listItemText}>{appointment.doctor}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        
        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <View>
            <View style={[styles.listCard, shadows.sm]}>
              <View style={styles.listHeader}>
                <Text style={styles.cardTitle}>Current Medications</Text>
                <Text style={styles.listSubTitle}>Active prescriptions</Text>
              </View>
              
              <View style={styles.listContent}>
                {medications.map((med, index) => (
                  <View 
                    key={med.id} 
                    style={[styles.listItem, index < medications.length - 1 && styles.listItemDivider]}
                  >
                    <Text style={styles.listItemTitle}>{med.name}</Text>
                    <Text style={styles.listItemMeta}>{med.dosage} • {med.frequency}</Text>
                    <Text style={styles.listItemTextSmall}>Prescribed by {med.prescribed}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={[styles.addActionButton, shadows.sm]}>
              {/* <Plus size={18} color={colors.primary} /> */}
              <Text style={styles.addActionButtonText}>Add New Medication</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Allergies Tab */}
        {activeTab === 'allergies' && (
          <View>
            <View style={[styles.listCard, shadows.sm]}>
              <View style={styles.listHeader}>
                <Text style={styles.cardTitle}>Known Allergies</Text>
                <Text style={styles.listSubTitle}>Allergic reactions and sensitivities</Text>
              </View>
              
              <View style={styles.listContent}>
                {allergies.map((allergy, index) => (
                  <View 
                    key={allergy.id} 
                    style={[styles.listItem, index < allergies.length - 1 && styles.listItemDivider]}
                  >
                    <View style={styles.listItemRow}>
                      <Text style={styles.listItemTitle}>{allergy.allergen}</Text>
                      <View style={[styles.statusChip, getAllergySeverityStyle(allergy.severity)]}>
                        <Text style={[styles.statusChipText, getAllergySeverityTextStyle(allergy.severity)]}>
                          {allergy.severity}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.listItemMeta}>{allergy.reaction}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={[styles.card, shadows.sm, styles.marginTopMd]}>
              <View style={styles.alertHeader}>
                {/* <AlertTriangle size={20} color={colors.warning} style={styles.detailIcon} /> */}
                <Text style={styles.activityTitle}>Important Notes</Text>
              </View>
              <Text style={styles.alertText}>
                Always check for allergies before prescribing new medications. 
                Notify all medical staff about severe allergies.
              </Text>
            </View>
            
            <TouchableOpacity style={[styles.addActionButton, shadows.sm]}>
              {/* <Plus size={18} color={colors.primary} /> */}
              <Text style={styles.addActionButtonText}>Add New Allergy</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// --- STYLESHEET DEFINITION ---

const styles = StyleSheet.create({
  // General
  container: {
    flex: 1,
    backgroundColor: colors.gray100, // bg-gray-50
  },
  marginTopMd: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
  },

  // Header
  header: {
    backgroundColor: colors.primary, // bg-blue-500 (assuming blue-500 is primary)
    paddingTop: spacing.xxl, // pt-12 (for status bar)
    paddingBottom: spacing.lg, // pb-6
    paddingHorizontal: spacing.md, // px-4
    marginBottom: -spacing.md, // Pull the actions up over the header background
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md, // mb-4
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18, // text-lg
    fontWeight: '700',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  headerSpacer: {
    width: 28, // w-7 * 4, matching icon size
  },

  // Patient Info Card (inside header)
  patientInfoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg, // rounded-xl
    padding: spacing.md, // p-4
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm, // mb-3
  },
  avatarPlaceholder: {
    backgroundColor: colors.gray200, // bg-gray-200
    borderWidth: 2,
    borderColor: colors.gray300, 
    borderStyle: 'dashed',
    borderRadius: radius.lg, // rounded-xl
    width: 64, // w-16
    height: 64, // h-16
  },
  patientDetails: {
    marginLeft: spacing.md, // ml-4
    flex: 1,
  },
  patientName: {
    fontSize: 20, // text-xl
    fontWeight: '700',
    color: colors.gray800,
  },
  patientMeta: {
    color: colors.gray600,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm, // mt-2
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    color: colors.gray600,
    marginLeft: spacing.xs, // ml-2
    fontSize: 12, // text-sm
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md, // py-4
    backgroundColor: colors.white,
    marginHorizontal: spacing.md, // mx-4
    borderRadius: radius.md, // rounded-lg
    marginTop: -spacing.md, // -mt-6 adjusted for header padding
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionIconWrapper: {
    borderRadius: radius.full,
    padding: spacing.sm, // p-3
    marginBottom: spacing.xs / 2, // mb-1
  },
  actionNewEMR: {
    backgroundColor: colors.primaryLight, // bg-blue-100
  },
  actionPrescription: {
    backgroundColor: colors.green100, // bg-green-100 (assuming green100 is defined)
  },
  actionSchedule: {
    backgroundColor: colors.purple100, // bg-purple-100 (assuming purple100 is defined)
  },
  actionContact: {
    backgroundColor: colors.orange100, // bg-orange-100 (assuming orange100 is defined)
  },
  actionText: {
    fontSize: 10, // text-xs
    color: colors.gray700,
    textAlign: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md, // mx-4
    marginTop: spacing.sm, // mt-2
    borderRadius: radius.md, // rounded-lg
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12, // py-3
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.white, // Default transparent border
  },
  tabButtonActive: {
    borderBottomColor: colors.primary, // border-blue-500
  },
  tabText: {
    // Shared text style
  },
  tabTextActive: {
    color: colors.primary, // text-blue-500
    fontWeight: '500',
  },
  tabTextInactive: {
    color: colors.gray500, // text-gray-500
  },

  // Content Scroll
  contentScroll: {
    flex: 1,
    paddingHorizontal: spacing.md, // px-4
    paddingVertical: spacing.md, // py-4
  },
  
  // Card Styles (Overview Tab)
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md, // rounded-lg
    padding: spacing.md, // p-4
    marginBottom: spacing.md, // mb-4
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm, // mb-3
  },
  cardTitle: {
    fontSize: 16, // text-lg
    fontWeight: '600',
    color: colors.gray800,
  },
  editText: {
    color: colors.primary, // text-blue-500
    fontSize: 14, // text-sm
  },
  
  // Personal Information Details
  detailGroup: {
    gap: 12, // space-y-3
  },
  detailRow: {
    flexDirection: 'row',
    // alignItems: 'center', // Align top for multiline
  },
  detailLabel: {
    color: colors.gray500,
    width: 96, // w-32 (adjust width as needed for density)
  },
  detailValue: {
    color: colors.gray800,
    flex: 1,
  },
  detailValueBold: {
    color: colors.gray800,
    // No explicit font-weight needed here unless different from default
  },
  detailMeta: {
    color: colors.gray600,
    fontSize: 12, // text-sm
  },

  // Upcoming Appointments
  upcomingAppointment: {
    borderLeftWidth: 2,
    borderLeftColor: colors.blue200, // border-blue-200 (assuming blue200 is defined)
    paddingLeft: spacing.sm, // pl-3
    paddingVertical: spacing.xs, // py-1
  },
  appointmentDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs, // mb-2
  },
  appointmentMarker: {
    backgroundColor: colors.primary, // bg-blue-500
    borderRadius: radius.full,
    padding: 6, // p-1 for icon size 12
    marginLeft: -16 - 6, // Adjusted to align marker left of the border (border width 2, marker size 12, padding 3)
    marginRight: spacing.xs, // mr-2
  },
  appointmentIcon: {
    // Icon styles if needed
  },
  appointmentDateText: {
    fontWeight: '500',
    color: colors.gray800,
  },
  appointmentReason: {
    color: colors.gray700,
    marginLeft: spacing.md, // ml-4
  },
  appointmentMeta: {
    color: colors.gray500,
    fontSize: 12, // text-sm
    marginLeft: spacing.md, // ml-4
  },

  // Recent Activity
  activityGroup: {
    gap: 12, // space-y-3
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconWrapper: {
    borderRadius: radius.full,
    padding: spacing.xs, // p-2
    marginRight: spacing.sm, // mr-3
  },
  activityEMR: {
    backgroundColor: colors.green100,
  },
  activityPrescription: {
    backgroundColor: colors.primaryLight,
  },
  activitySchedule: {
    backgroundColor: colors.purple100,
  },
  activityTitle: {
    fontWeight: '500',
    color: colors.gray800,
  },
  activityMeta: {
    color: colors.gray500,
    fontSize: 12, // text-sm
  },

  // List Card Styles (History, Medications, Allergies Tabs)
  listCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  listHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200, // border-gray-100
  },
  listSubTitle: {
    color: colors.gray500,
    fontSize: 14, // text-sm
  },
  listContent: {
    // No explicit style needed here, used for container
  },
  listItem: {
    padding: spacing.md,
  },
  listItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200, // divide-y divide-gray-100
  },
  listItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTitle: {
    fontWeight: '500',
    color: colors.gray800,
  },
  listItemMeta: {
    color: colors.gray600,
    fontSize: 14, // text-sm
    marginTop: 4,
  },
  listItemText: {
    color: colors.gray600,
    fontSize: 14, // text-sm
    marginRight: spacing.md, // mr-4
  },
  listItemTextSmall: {
    color: colors.gray500,
    fontSize: 12, // text-sm
    marginTop: 4,
  },
  appointmentDetailRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: spacing.xs, // mr-1
  },

  // Status Chips
  statusChip: {
    paddingHorizontal: spacing.xs, // px-2
    paddingVertical: 2, // py-1
    borderRadius: radius.full,
  },
  statusChipText: {
    fontSize: 10, // text-xs
    fontWeight: '500',
  },
  statusChipActive: {
    backgroundColor: colors.red100, // bg-red-100
  },
  statusTextActive: {
    color: colors.red800, // text-red-800
  },
  statusChipManaged: {
    backgroundColor: colors.green100, // bg-green-100
  },
  statusTextManaged: {
    color: colors.green800, // text-green-800
  },
  statusChipInactive: {
    backgroundColor: colors.gray200, // bg-gray-100
  },
  statusTextInactive: {
    color: colors.gray800,
  },

  // Allergy Severity Chips
  severityChipSevere: {
    backgroundColor: colors.red100, 
  },
  severityTextSevere: {
    color: colors.red800, 
  },
  severityChipModerate: {
    backgroundColor: colors.orange100, // bg-orange-100
  },
  severityTextModerate: {
    color: colors.orange800, // text-orange-800
  },
  severityChipMild: {
    backgroundColor: colors.yellow100, // bg-yellow-100
  },
  severityTextMild: {
    color: colors.yellow800, // text-yellow-800
  },

  // Add Action Button
  addActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  addActionButtonText: {
    color: colors.primary, // text-blue-500
    fontWeight: '500',
    marginLeft: spacing.xs, // ml-2
  },

  // Allergy Notes
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertText: {
    color: colors.gray600,
    fontSize: 14, // text-sm
    marginTop: spacing.xs,
  },
});

export default PatientDetailsScreen;