import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  StatusBar
} from 'react-native';

// Import your theme file
import { colors, spacing, radius, shadows } from '../../Constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icons
import { 
  Phone, 
  Calendar, 
  MapPin, 
  Pill, 
  AlertTriangle, 
  FileText, 
  Plus, 
  ChevronRight,
  Clock,
  User,
  Activity,
  MoreVertical,
  ArrowRight
} from 'lucide-react-native';

const PatientDetailsScreen = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();

  // --- MOCK DATA (Unchanged) ---
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

  const medicalHistory = [
    { id: 1, condition: 'Hypertension', diagnosed: '2019', status: 'Managed' },
    { id: 2, condition: 'Seasonal Allergies', diagnosed: '2015', status: 'Active' },
    { id: 3, condition: 'Type 2 Diabetes', diagnosed: '2021', status: 'Managed' },
    { id: 4, condition: 'Asthma', diagnosed: '2010', status: 'Inactive' }
  ];

  const medications = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribed: 'Dr. Williams' },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribed: 'Dr. Williams' },
    { id: 3, name: 'Albuterol Inhaler', dosage: '2 puffs', frequency: 'As needed', prescribed: 'Dr. Williams' }
  ];

  const allergies = [
    { id: 1, allergen: 'Penicillin', reaction: 'Skin rash', severity: 'Moderate' },
    { id: 2, allergen: 'Shellfish', reaction: 'Anaphylaxis', severity: 'Severe' },
    { id: 3, allergen: 'Latex', reaction: 'Skin irritation', severity: 'Mild' }
  ];

  const appointmentHistory = [
    { id: 1, date: '2023-05-15', time: '10:30 AM', reason: 'Annual Physical', doctor: 'Dr. Williams', status: 'Completed' },
    { id: 2, date: '2023-03-22', time: '2:15 PM', reason: 'Follow-up Visit', doctor: 'Dr. Williams', status: 'Completed' },
    { id: 3, date: '2023-01-10', time: '11:00 AM', reason: 'Lab Results Review', doctor: 'Dr. Williams', status: 'Completed' },
    { id: 4, date: '2022-11-05', time: '9:45 AM', reason: 'Flu Shot', doctor: 'Dr. Peterson', status: 'Completed' }
  ];

  // --- HELPER FUNCTIONS ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { bg: '#FEF2F2', text: '#DC2626' }; // Red
      case 'Managed': return { bg: '#ECFDF5', text: '#059669' }; // Green
      default: return { bg: '#F3F4F6', text: '#4B5563' }; // Gray
    }
  };

  const getAllergyColor = (severity) => {
    switch (severity) {
      case 'Severe': return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'Moderate': return { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' };
      default: return { bg: '#FEFCE8', text: '#CA8A04', border: '#FEF08A' };
    }
  };

  // --- RENDER ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* 1. Immersive Header Section */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerNav}>
          <TouchableOpacity style={styles.navButton}>
            <ChevronRight size={24} color="white" style={{transform: [{rotate: '180deg'}]}} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Profile</Text>
          <TouchableOpacity style={styles.navButton}>
            <MoreVertical size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Floating Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{patientData.name.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{patientData.name}</Text>
              <Text style={styles.profileMeta}>
                {patientData.id} • {patientData.age} Yrs • {patientData.gender}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileDivider} />
          
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Phone size={16} color={colors.primary} />
              </View>
              <Text style={styles.contactLabel}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <MapPin size={16} color={colors.success} />
              </View>
              <Text style={styles.contactLabel}>Locate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                <AlertTriangle size={16} color={colors.error} />
              </View>
              <Text style={styles.contactLabel}>Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Main Content Area */}
      <View style={styles.contentContainer}>
        
        {/* Quick Action Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          <TouchableOpacity style={styles.quickActionBtn}>
             <FileText size={20} color={colors.primary} />
             <Text style={styles.quickActionText}>New EMR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
             <Pill size={20} color={colors.primary} />
             <Text style={styles.quickActionText}>Prescribe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
             <Calendar size={20} color={colors.primary} />
             <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modern Tabs (Pill Style) */}
        <View style={styles.tabContainer}>
          {['overview', 'history', 'medications', 'allergies'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && (
            <>
              {/* Emergency Contact Card */}
              <View style={styles.sectionCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Emergency Contact</Text>
                  <TouchableOpacity><Text style={styles.linkText}>Edit</Text></TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <User size={20} color={colors.gray600} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{patientData.emergencyContact.relationship}</Text>
                    <Text style={styles.infoValue}>{patientData.emergencyContact.name}</Text>
                    <Text style={styles.infoSub}>{patientData.emergencyContact.phone}</Text>
                  </View>
                </View>
              </View>

              {/* Recent Activity Timeline */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.timelineContainer}>
                  {[
                    { title: 'New EMR Created', sub: 'Dr. Williams', icon: FileText, color: colors.primary },
                    { title: 'Prescription Renewed', sub: 'Metformin', icon: Pill, color: colors.success },
                    { title: 'Appt Scheduled', sub: 'Annual Physical', icon: Calendar, color: colors.warning },
                  ].map((item, idx, arr) => (
                    <View key={idx} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                        {idx !== arr.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>{item.title}</Text>
                        <Text style={styles.timelineSub}>{item.sub}</Text>
                      </View>
                      <Text style={styles.timelineTime}>2d ago</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* --- HISTORY TAB --- */}
          {activeTab === 'history' && (
            <View>
              <Text style={styles.tabHeader}>Medical Conditions</Text>
              {medicalHistory.map((item) => {
                 const style = getStatusColor(item.status);
                 return (
                  <View key={item.id} style={styles.cardItem}>
                    <View style={styles.cardRow}>
                      <Text style={styles.itemTitle}>{item.condition}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                        <Text style={[styles.statusText, { color: style.text }]}>{item.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemMeta}>Diagnosed in {item.diagnosed}</Text>
                  </View>
                 );
              })}
              
              <Text style={[styles.tabHeader, { marginTop: 24 }]}>Past Appointments</Text>
              {appointmentHistory.map((appt) => (
                <View key={appt.id} style={styles.cardItem}>
                   <View style={styles.cardRow}>
                      <Text style={styles.itemTitle}>{appt.reason}</Text>
                      <Text style={styles.dateText}>{appt.date}</Text>
                   </View>
                   <View style={styles.apptDetailRow}>
                      <View style={styles.iconTag}>
                        <Clock size={12} color={colors.gray500} />
                        <Text style={styles.tagText}>{appt.time}</Text>
                      </View>
                      <View style={styles.iconTag}>
                        <User size={12} color={colors.gray500} />
                        <Text style={styles.tagText}>{appt.doctor}</Text>
                      </View>
                   </View>
                </View>
              ))}
            </View>
          )}

          {/* --- MEDICATIONS TAB --- */}
          {activeTab === 'medications' && (
            <View>
               <TouchableOpacity style={styles.addButton}>
                  <Plus size={20} color="white" />
                  <Text style={styles.addButtonText}>Add Medication</Text>
               </TouchableOpacity>

               {medications.map((med) => (
                 <View key={med.id} style={styles.medicationCard}>
                    <View style={styles.medIcon}>
                       <Pill size={24} color={colors.primary} />
                    </View>
                    <View style={{flex: 1}}>
                       <Text style={styles.medName}>{med.name}</Text>
                       <Text style={styles.medDose}>{med.dosage} • {med.frequency}</Text>
                       <Text style={styles.medDoctor}>Px: {med.prescribed}</Text>
                    </View>
                    <ChevronRight size={20} color={colors.gray400} />
                 </View>
               ))}
            </View>
          )}

          {/* --- ALLERGIES TAB --- */}
          {activeTab === 'allergies' && (
            <View>
               <View style={styles.warningBanner}>
                 <AlertTriangle size={20} color={colors.warningDark} />
                 <Text style={styles.warningText}>
                   Verify allergies before prescribing new medication.
                 </Text>
               </View>

               {allergies.map((allergy) => {
                 const style = getAllergyColor(allergy.severity);
                 return (
                  <View key={allergy.id} style={[styles.allergyCard, { borderColor: style.border, backgroundColor: style.bg }]}>
                    <View style={styles.cardRow}>
                      <Text style={[styles.allergyName, { color: style.text }]}>{allergy.allergen}</Text>
                      <View style={[styles.severityBadge, { borderColor: style.text }]}>
                        <Text style={[styles.severityText, { color: style.text }]}>{allergy.severity}</Text>
                      </View>
                    </View>
                    <Text style={styles.allergyReaction}>Reaction: {allergy.reaction}</Text>
                  </View>
                 );
               })}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Very light gray background
  },
  
  // Header
  headerContainer: {
    backgroundColor: colors.primary,
    paddingBottom: 80, // Space for the floating card overlap
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  navButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

  // Profile Card
  profileCard: {
    position: 'absolute',
    bottom: -60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    ...shadows.lg,
    zIndex: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 13,
    color: colors.gray500,
    fontWeight: '500',
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginVertical: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactItem: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
  },

  // Content Area
  contentContainer: {
    flex: 1,
    marginTop: 70, // Push content down to account for floating card
  },
  quickActionsScroll: {
    paddingHorizontal: 20,
    marginBottom: 20,
    maxHeight: 50,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  quickActionText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray700,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray500,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.gray500,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray800,
  },
  infoSub: {
    fontSize: 12,
    color: colors.gray400,
  },

  // Timeline
  timelineContainer: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.gray200,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
  },
  timelineSub: {
    fontSize: 12,
    color: colors.gray500,
  },
  timelineTime: {
    fontSize: 11,
    color: colors.gray400,
  },

  // Generic Card Items (History)
  tabHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray500,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  cardItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 13,
    color: colors.gray500,
  },
  dateText: {
    fontSize: 13,
    color: colors.gray500,
  },
  apptDetailRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  iconTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  tagText: {
    fontSize: 12,
    color: colors.gray600,
    marginLeft: 4,
  },

  // Medications
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    ...shadows.sm,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
  },
  medDose: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: 2,
  },
  medDoctor: {
    fontSize: 11,
    color: colors.gray400,
    fontStyle: 'italic',
  },

  // Allergies
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    color: '#B45309',
    fontSize: 13,
  },
  allergyCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  allergyName: {
    fontSize: 16,
    fontWeight: '700',
  },
  severityBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  allergyReaction: {
    marginTop: 8,
    color: colors.gray700,
    fontSize: 13,
  },
});

export default PatientDetailsScreen;