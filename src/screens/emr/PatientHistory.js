import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, FlatList } from 'react-native';
import { 
  Activity, 
  AlertCircle, 
  Stethoscope, 
  Pill, 
  FileText, 
  Users, 
  Clipboard, 
  Calendar as CalendarIcon,
  ChevronLeft
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getVisitHistory } from '../../api/emrApi';
import { useNavigation, useRoute } from '@react-navigation/native';

const PatientHistory = () => {
  const route =useRoute()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitList, setVisitList] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const insets = useSafeAreaInsets();

  // Default IDs from prompt if not passed via navigation
  const patientData = route?.params?.patientData;
  const registrationId = patientData?.registrationId;
  const visitId = patientData?.visitId; // Initial visit ID to focus if available

  useEffect(() => {
    fetchHistory();
  }, [registrationId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      // We assume fetching by registrationId gives us the full history if visitId is not strictly filtering to one
      // If the API supports fetching all history for a patient, we might need a different call or params.
      // Based on the prompt "emr/visit-history?registrationId=78...", it seems to return a list.
      const response = await getVisitHistory(registrationId, visitId);
      
      if (response && response.data && response.data.data && response.data.data.length > 0) {
        const visits = response.data.data;
        setVisitList(visits);
        
        // If we have a specific visitId passed, try to select it, otherwise default to the first one (latest)
        const initialVisit = visits.find(v => v._id === visitId) || visits[0];
        setSelectedVisitId(initialVisit._id);
      } else {
        setVisitList([]);
        setSelectedVisitId(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load patient history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedVisit = visitList.find(v => v._id === selectedVisitId);

  const EmptyHistoryState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <FileText size={48} color={colors.primary} style={{ opacity: 0.8 }} />
      </View>
      <Text style={styles.emptyTitle}>No History Found</Text>
      <Text style={styles.emptyDescription}>
        There are no past visit records available for this patient at the moment.
      </Text>
      <TouchableOpacity style={styles.backHomeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backHomeText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const DateTabs = () => (
    <View style={styles.tabsContainer}>
      <FlatList
        data={visitList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.tabsContent}
        renderItem={({ item }) => {
          const isSelected = item._id === selectedVisitId;
          return (
            <TouchableOpacity 
              style={[styles.tabItem, isSelected && styles.tabItemSelected]}
              onPress={() => setSelectedVisitId(item._id)}
            >
              <CalendarIcon size={14} color={isSelected ? colors.white : colors.gray500} style={{marginRight: 6}} />
              <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                {item.visitDate}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Patient History</Text>
            <Text style={styles.headerSubtitle}>{patientData?.patientName || 'Patient EMR'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading patient history...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <AlertCircle size={48} color={colors.warning} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : visitList.length === 0 ? (
          <EmptyHistoryState />
        ) : (
          <>
            <DateTabs />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {selectedVisit ? (
                <HistoryContent visit={selectedVisit} />
              ) : (
                 <View style={styles.centerContent}>
                    <Text style={styles.errorText}>Select a visit to view details.</Text>
                 </View>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

const HistoryContent = ({ visit }) => {
  const emr = visit.emrData;

  // Helper to render section headers
  const SectionHeader = ({ icon: Icon, title, color }) => (
    <View style={styles.sectionHeader}>
      <Icon size={20} color={color || colors.primary} />
      <Text style={[styles.sectionTitle, { color: color || colors.text }]}>{title}</Text>
    </View>
  );

  if (!emr) {
      return (
          <View style={styles.emptyVisitContainer}>
            <View style={styles.headerCard}>
                <View>
                <Text style={styles.dateLabel}>Visit Date</Text>
                <Text style={styles.dateValue}>{visit.visitDate}</Text>
                </View>
                <View style={[styles.statusBadge, visit.visitStatus === 'SIGNED' ? styles.statusSigned : {}]}>
                <Text style={styles.statusText}>{visit.visitStatus || 'UNKNOWN'}</Text>
                </View>
            </View>
            <View style={styles.emptySection}>
                 <Text style={styles.emptySectionText}>No EMR data recorded for this visit.</Text>
            </View>
          </View>
      )
  }

  return (
    <>
      {/* 1. TOP HEADER & STATUS */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.dateLabel}>Visit Date</Text>
          <Text style={styles.dateValue}>{visit.visitDate}</Text>
        </View>
        <View style={[styles.statusBadge, visit.visitStatus === 'SIGNED' ? styles.statusSigned : {}]}>
          <Text style={styles.statusText}>{visit.visitStatus}</Text>
        </View>
      </View>

      {/* 2. VITALS GRID (Quick Snapshot) */}
      <SectionHeader icon={Activity} title="Patient Vitals" />
      <View style={styles.vitalsGrid}>
        {emr?.vitals?.length > 0 ? (
            emr.vitals.map((vital, index) => (
                <View key={index} style={styles.vitalBox}>
                <Text style={styles.vitalName}>{vital.name}</Text>
                <Text style={styles.vitalValue}>{vital.value} <Text style={styles.vitalUnit}>{vital.unit}</Text></Text>
                </View>
            ))
        ) : (
            <Text style={styles.noDataText}>No vitals recorded</Text>
        )}
      </View>

      {/* 3. ALLERGIES (High Priority) */}
      {emr?.allergies?.length > 0 && (
        <View style={styles.alertCard}>
          <SectionHeader icon={AlertCircle} title="Allergies" color="#B91C1C" />
          {emr?.allergies?.map((item, i) => (
            <View key={i} style={styles.allergyItem}>
              <Text style={styles.allergyName}>{item.allergenName} ({item.severity})</Text>
              <Text style={styles.allergyReaction}>Reaction: {item.reaction}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. CLINICAL DETAILS (Complaints & Diagnosis) */}
      <View style={styles.contentCard}>
        <SectionHeader icon={Stethoscope} title="Clinical Assessment" />
        
        <Text style={styles.subHeading}>Chief Complaints</Text>
        <View style={styles.chipContainer}>
          {emr?.chiefComplaint?.length > 0 ? (
             emr.chiefComplaint.map((c, i) => (
                <View key={i} style={styles.complaintChip}>
                <Text style={styles.chipText}>{c.complaintName} ({c.duration} {c.durationType})</Text>
                </View>
            ))
          ) : (
             <Text style={styles.noDataText}>No complaints recorded</Text>
          )}
        </View>

        <View style={styles.divider} />

        <Text style={styles.subHeading}>Diagnosis</Text>
        {emr?.diagnosis?.length > 0 ? (
             emr.diagnosis.map((d, i) => (
            <View key={i} style={styles.diagnosisRow}>
                <Text style={styles.diagnosisName}>{d.diagnosisName}</Text>
                <Text style={styles.icdCode}>ICD: {d.icdCode}</Text>
            </View>
            ))
        ) : (
             <Text style={styles.noDataText}>No diagnosis recorded</Text>
        )}
      </View>

      {/* 5. PHARMACY & MEDICATIONS */}
      <View style={styles.contentCard}>
        <SectionHeader icon={Pill} title="Prescribed Medications" />
        {emr?.pharmacy?.length > 0 ? (
            emr.pharmacy.map((med, i) => (
            <View key={i} style={styles.medicationItem}>
                <View style={styles.medHeader}>
                <Text style={styles.medName}>{med.medicineName}</Text>
                <Text style={styles.medDuration}>{med.duration} {med.durationType}</Text>
                </View>
                <Text style={styles.medDosage}>{med.dosageAmount} {med.dosageUnit} • {med.frequency}</Text>
                <Text style={styles.medInstruction}>Note: {med.instructions}</Text>
            </View>
            ))
        ) : (
             <Text style={styles.noDataText}>No medications prescribed</Text>
        )}
      </View>

      {/* 6. HISTORY & LIFESTYLE */}
      <View style={styles.contentCard}>
        <SectionHeader icon={Users} title="Patient Background" />
        
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Family History:</Text>
          <Text style={styles.historyValue}>{emr?.familyHistory || 'None'}</Text>
        </View>
        
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Surgical History:</Text>
          <Text style={styles.historyValue}>{emr?.surgicalHistory || 'None'}</Text>
        </View>

        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Habits:</Text>
          <Text style={styles.historyValue}>{emr?.patientHistory || 'None'}</Text>
        </View>
      </View>

      {/* 7. DOCTOR'S INSTRUCTIONS */}
      {emr?.instructions && emr.instructions.length > 0 && (
        <View style={[styles.contentCard, styles.instructionCard]}>
          <SectionHeader icon={FileText} title="Doctor's Instructions" color={colors.primary} />
          <Text style={styles.instructionText}>
            {emr.instructions[0].generalInstructions}
          </Text>
        </View>
      )}
    </>
  );
};

const colors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  success: '#059669',
  warning: '#DC2626',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  text: '#1F2937',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: colors.primary },
  container: { flex: 1, backgroundColor: colors.gray50, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  // Date Tabs
  tabsContainer: { backgroundColor: colors.white, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  tabsContent: { paddingHorizontal: 16 },
  tabItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.gray100, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gray200 
  },
  tabItemSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, color: colors.gray500, fontWeight: '600' },
  tabTextSelected: { color: colors.white },

  // Header container styling
  headerContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 15,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  backHomeButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 25,
    elevation: 2,
  },
  backHomeText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  emptyVisitContainer: { padding: 16 },
  emptySection: { padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 16 },
  emptySectionText: { color: colors.gray500, fontStyle: 'italic' },
  noDataText: { fontSize: 13, color: colors.gray400, fontStyle: 'italic' },


  // Existing Styles...
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  dateLabel: { fontSize: 12, color: colors.gray500, fontWeight: '600', textTransform: 'uppercase' },
  dateValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.gray100 },
  statusSigned: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 12, fontWeight: '700', color: colors.success },

  // Sections
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  contentCard: { backgroundColor: colors.white, padding: 16, borderRadius: 20, marginBottom: 16 },

  // Vitals
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  vitalBox: { 
    width: '31%', 
    backgroundColor: colors.white, 
    padding: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: colors.gray100,
    alignItems: 'center'
  },
  vitalName: { fontSize: 10, color: colors.gray500, marginBottom: 4, textAlign: 'center' },
  vitalValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  vitalUnit: { fontSize: 10, fontWeight: '400', color: colors.gray500 },

  // Allergies
  alertCard: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FEE2E2' },
  allergyItem: { marginTop: 8 },
  allergyName: { fontSize: 15, fontWeight: '700', color: '#991B1B' },
  allergyReaction: { fontSize: 13, color: '#B91C1C', opacity: 0.8 },

  // Clinical Chips
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  complaintChip: { backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  chipText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  subHeading: { fontSize: 14, fontWeight: '600', color: colors.gray500, marginTop: 12 },
  diagnosisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  diagnosisName: { fontSize: 15, fontWeight: '600' },
  icdCode: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: 15 },

  // Medications
  medicationItem: { padding: 12, backgroundColor: colors.gray50, borderRadius: 12, marginBottom: 10 },
  medHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  medName: { fontSize: 16, fontWeight: '700', color: colors.primary },
  medDuration: { fontSize: 12, color: colors.gray500 },
  medDosage: { fontSize: 14, fontWeight: '600', color: colors.text },
  medInstruction: { fontSize: 12, color: colors.gray500, marginTop: 4, fontStyle: 'italic' },

  // History
  historyRow: { marginBottom: 10 },
  historyLabel: { fontSize: 13, fontWeight: '700', color: colors.gray500 },
  historyValue: { fontSize: 14, color: colors.text, marginTop: 2 },

  // Instructions
  instructionCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  instructionText: { fontSize: 14, lineHeight: 20, color: colors.text, fontStyle: 'italic' },

  // Loading & Error States
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.gray500, fontWeight: '500' },
  errorText: { marginTop: 12, fontSize: 16, color: colors.warning, fontWeight: '600', textAlign: 'center', marginHorizontal: 32 },
  retryButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 24 },
  retryText: { color: colors.white, fontSize: 14, fontWeight: '700' }
});
export default PatientHistory;