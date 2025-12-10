
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet 
} from 'react-native';

// Navigation/Router logic commented out
// import { useRouter } from 'expo-router'; 

// Import your theme file
// Assuming 'colors', 'spacing', 'typography', 'radius', 'shadows' are correctly imported
import { colors, spacing, typography, radius, shadows } from '../../Constants/theme';

// Icons commented out
import { 
  Mic, 
  MicOff, 
  Send, 
  FileText, 
  Stethoscope, 
  Heart, 
  Activity, 
  ChevronLeft, 
  Lightbulb, 
  Plus, 
  Trash2,
  Calendar,
  User,
  MapPin
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const EMRGenerationScreen = () => {
  // const router = useRouter(); // Router commented out
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const insets = useSafeAreaInsets()
  // Use 'string' for type safety if not using TypeScript, otherwise remove explicit typing if it causes errors
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medications: '',
    notes: ''
  });
  
  const textInputRef = useRef(null); // Remove <TextInput> type annotation for pure JS

  // Mock data remains unchanged
  const diagnosisSuggestions = [
    "Hypertension", "Type 2 Diabetes", "Asthma", "Migraine", "Arthritis", 
    "Anxiety", "Depression", "GERD", "Allergic Rhinitis", "Urinary Tract Infection"
  ];
  const symptomsSuggestions = [
    "Headache", "Fatigue", "Chest pain", "Shortness of breath", "Nausea", 
    "Dizziness", "Joint pain", "Fever", "Cough", "Abdominal pain"
  ];
  const treatmentSuggestions = [
    "Lifestyle modification", "Medication therapy", "Physical therapy", 
    "Cognitive behavioral therapy", "Dietary changes", "Exercise regimen", 
    "Stress management", "Regular monitoring", "Referral to specialist", 
    "Patient education"
  ];
  const mockAiSuggestions = [
    "Consider ordering an ECG for chest pain evaluation",
    "Patient's BMI indicates need for dietary consultation",
    "Recent medication changes may affect blood pressure",
    "Family history of diabetes requires regular monitoring",
    "Patient reports stress as a contributing factor"
  ];

  // Toggle voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setTranscript("Patient reports persistent headaches for the past 3 weeks, with associated nausea...");
        setAiSuggestions(mockAiSuggestions);
      }, 2000);
    } else {
      // Stop recording logic would go here
    }
  };

  // Add suggestion to form
  const addSuggestion = (suggestion) => { // Removed type annotation
    setSelectedSuggestions(prev => [...prev, suggestion]);
    
    // Add to appropriate form field based on active tab
    const field = activeTab; // field is implicitly keyof typeof formData
    setFormData(prev => ({
        ...prev, 
        [field]: prev[field] + (prev[field] ? ', ' : '') + suggestion
    }));
  };

  // Remove suggestion
  const removeSuggestion = (index) => { // Removed type annotation
    const newSuggestions = [...selectedSuggestions];
    newSuggestions.splice(index, 1);
    setSelectedSuggestions(newSuggestions);
    // Note: A full implementation would also remove the text from the formData field.
  };

  // Handle form input changes
  const handleInputChange = (field, value) => { // Removed type annotation
    setFormData(prev => ({...prev, [field]: value}));
  };

  // Submit EMR
  const handleSubmit = () => {
    // In a real app, this would save the EMR data
    alert('EMR generated successfully!');
    // router.back(); // Router commented out
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header,{paddingTop:insets.top+20}]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => {/* router.back() */}}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate EMR</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Patient Info */}
        <View style={[styles.patientInfoContainer, shadows.sm]}>
          <View style={styles.patientInfoRow}>
            <View style={styles.patientAvatarPlaceholder} />
            <View style={styles.patientDetails}>
              <Text style={styles.patientName}>Sarah Johnson</Text>
              <Text style={styles.patientMeta}>PT-12345 • Female, 32</Text>
            </View>
          </View>
        </View>

        {/* Voice Input Section */}
        <View style={[styles.voiceInputCard, shadows.sm]}>
          <View style={styles.voiceInputHeader}>
            <Text style={styles.cardTitle}>Voice Input</Text>
            <TouchableOpacity 
              style={[
                styles.micButton, 
                { backgroundColor: isRecording ? colors.red100 : colors.primaryLight }
              ]}
              onPress={toggleRecording}
            >
              {isRecording ? (
                <MicOff size={24} color={colors.error} />
              ) : (
                <Mic size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          {transcript ? (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          ) : (
            <View style={styles.micPlaceholder}>
              {/* <Mic size={32} color={colors.gray400} /> */}
              <Text style={styles.micPlaceholderText}>
                {isRecording 
                  ? "Listening... Speak now" 
                  : "Tap microphone to start voice input"}
              </Text>
            </View>
          )}
        </View>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <View style={[styles.suggestionCard, shadows.sm]}>
            <View style={styles.suggestionHeader}>
              {/* <Lightbulb size={20} color={colors.warning} /> */}
              <Text style={styles.suggestionTitle}>AI Suggestions</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionScroll}>
              {aiSuggestions.map((suggestion, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => addSuggestion(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Selected Suggestions */}
        {selectedSuggestions.length > 0 && (
          <View style={[styles.selectedTermsCard, shadows.sm]}>
            <Text style={styles.cardTitle}>Selected Terms</Text>
            <View style={styles.selectedTermsRow}>
              {selectedSuggestions.map((suggestion, index) => (
                <View 
                  key={index} 
                  style={styles.selectedTermChip}
                >
                  <Text style={styles.selectedTermText}>{suggestion}</Text>
                  <TouchableOpacity onPress={() => removeSuggestion(index)} style={styles.removeTermButton}>
                    <Trash2 size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Form Tabs */}
        <View style={[styles.tabContainer, shadows.sm]}>
          {['diagnosis', 'symptoms', 'treatment'].map((tab) => (
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

        {/* Form Content */}
        <ScrollView style={styles.formContentScroll}>
          {activeTab === 'diagnosis' && (
            <View style={[styles.tabContentCard, shadows.sm]}>
              <Text style={styles.cardTitle}>Diagnosis</Text>
              
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="Enter diagnosis..."
                multiline
                value={formData.diagnosis}
                onChangeText={(text) => handleInputChange('diagnosis', text)}
              />
              
              <Text style={styles.subTitle}>Common Diagnoses</Text>
              <View style={styles.suggestionGrid}>
                {diagnosisSuggestions.map((diagnosis, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.suggestionGridChip}
                    onPress={() => addSuggestion(diagnosis)}
                  >
                    <Text style={styles.suggestionGridText}>{diagnosis}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'symptoms' && (
            <View style={[styles.tabContentCard, shadows.sm]}>
              <Text style={styles.cardTitle}>Symptoms</Text>
              
              <TextInput
                style={styles.textInput}
                placeholder="Enter symptoms..."
                multiline
                value={formData.symptoms}
                onChangeText={(text) => handleInputChange('symptoms', text)}
              />
              
              <Text style={styles.subTitle}>Common Symptoms</Text>
              <View style={styles.suggestionGrid}>
                {symptomsSuggestions.map((symptom, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.suggestionGridChip}
                    onPress={() => addSuggestion(symptom)}
                  >
                    <Text style={styles.suggestionGridText}>{symptom}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'treatment' && (
            <View style={[styles.tabContentCard, shadows.sm]}>
              <Text style={styles.cardTitle}>Treatment Plan</Text>
              
              <TextInput
                style={styles.textInput}
                placeholder="Enter treatment plan..."
                multiline
                value={formData.treatment}
                onChangeText={(text) => handleInputChange('treatment', text)}
              />
              
              <Text style={styles.subTitle}>Common Treatments</Text>
              <View style={styles.suggestionGrid}>
                {treatmentSuggestions.map((treatment, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.suggestionGridChip}
                    onPress={() => addSuggestion(treatment)}
                  >
                    <Text style={styles.suggestionGridText}>{treatment}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={[styles.cardTitle, styles.marginTopLg]}>Medications</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter prescribed medications..."
                multiline
                value={formData.medications}
                onChangeText={(text) => handleInputChange('medications', text)}
              />
              
              <Text style={[styles.cardTitle, styles.marginTopLg]}>Additional Notes</Text>
              <TextInput
                style={styles.textInputLarge}
                placeholder="Enter additional notes..."
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(text) => handleInputChange('notes', text)}
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            {/* <FileText size={24} color="white" /> */}
            <Text style={styles.submitButtonText}>Generate EMR</Text>
          </TouchableOpacity>
          <View style={{height: spacing.xl}} /> {/* Extra space for scroll */}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// --- STYLESHEET DEFINITION ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100, // bg-gray-50
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: colors.primary, // bg-blue-600
    paddingTop: spacing.xxl, // pt-12 (adjust based on system status bar height)
    paddingBottom: spacing.md, // pb-4
    paddingHorizontal: spacing.md, // px-4
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    ...typography.h4, // text-xl
    fontWeight: '700',
    marginLeft: spacing.md, // ml-4
  },

  // Patient Info
  patientInfoContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatarPlaceholder: {
    backgroundColor: colors.gray200, // bg-gray-200
    borderWidth: 2,
    borderColor: colors.gray300, // border-dashed mock
    borderStyle: 'dashed',
    borderRadius: radius.md,
    width: 48, // w-12
    height: 48, // h-12
  },
  patientDetails: {
    marginLeft: spacing.sm, // ml-3
  },
  patientName: {
    fontWeight: '700',
    color: colors.gray800,
  },
  patientMeta: {
    color: colors.gray600,
    fontSize: 14, // text-sm
  },

  // Voice Input Card
  voiceInputCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md, // mx-4
    marginTop: spacing.md, // mt-4
    borderRadius: radius.lg, // rounded-xl
    padding: spacing.md, // p-4
  },
  voiceInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm, // mb-3
  },
  cardTitle: {
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 4, // mb-2 adjusted for reuse in form
  },
  micButton: {
    padding: spacing.sm, // p-2
    borderRadius: radius.full,
  },
  transcriptBox: {
    backgroundColor: colors.primaryLight, // bg-blue-50
    borderRadius: radius.md, // rounded-lg
    padding: spacing.sm, // p-3
  },
  transcriptText: {
    color: colors.gray700,
  },
  micPlaceholder: {
    backgroundColor: colors.gray200, // bg-gray-100
    borderRadius: radius.md,
    padding: spacing.md, // p-4
    alignItems: 'center',
  },
  micPlaceholderText: {
    color: colors.gray500,
    marginTop: spacing.sm, // mt-2
    textAlign: 'center',
  },

  // AI Suggestions
  suggestionCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md, // mx-4
    marginTop: spacing.md, // mt-4
    borderRadius: radius.lg, // rounded-xl
    padding: spacing.md, // p-4
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm, // mb-3
  },
  suggestionTitle: {
    fontWeight: '600',
    color: colors.gray800,
    marginLeft: spacing.sm, // ml-2
  },
  suggestionScroll: {
    // No specific style needed, just for horizontal scrolling
  },
  suggestionChip: {
    backgroundColor: colors.amber100, // bg-amber-100
    borderRadius: radius.md, // rounded-lg
    paddingHorizontal: spacing.sm, // px-3
    paddingVertical: spacing.xs, // py-2
    marginRight: spacing.sm, // mr-2
  },
  suggestionText: {
    color: colors.amber800, // text-amber-800
    fontSize: 14, // text-sm
  },
  
  // Selected Terms
  selectedTermsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md, 
    marginTop: spacing.md, 
    borderRadius: radius.lg, 
    padding: spacing.md, 
  },
  selectedTermsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTermChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight, // bg-blue-100
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, 
    paddingVertical: 4, // py-1
    marginRight: spacing.sm, // mr-2
    marginBottom: spacing.sm, // mb-2
  },
  selectedTermText: {
    color: colors.primaryDark, // text-blue-800
    fontSize: 14, 
    marginRight: 4, // mr-1
  },
  removeTermButton: {
    marginLeft: 2,
    // Styles for the icon container if needed
  },

  // Form Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md, // mx-4
    marginTop: spacing.md, // mt-4
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
  
  // Form Content
  formContentScroll: {
    flex: 1,
    paddingHorizontal: spacing.md, // px-4
    paddingVertical: spacing.md, // py-4
  },
  tabContentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg, // rounded-xl
    padding: spacing.md, // p-4
    marginBottom: spacing.md, // Add margin to separate card from button/next screen
  },
  subTitle: {
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: spacing.sm, // mb-2
    marginTop: 8, // slight margin
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray300, // border-gray-300
    borderRadius: radius.md, // rounded-lg
    padding: spacing.sm, // p-3
    marginBottom: spacing.md, // mb-4
    minHeight: 40,
    textAlignVertical: 'top',
  },
  textInputLarge: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 100, // Explicit height for multiline
    textAlignVertical: 'top',
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionGridChip: {
    backgroundColor: colors.gray200, // bg-gray-100
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    marginRight: spacing.sm, 
    marginBottom: spacing.sm, 
  },
  suggestionGridText: {
    color: colors.gray700,
    fontSize: 14, 
  },
  marginTopLg: {
    marginTop: spacing.md, // mt-4
  },

  // Submit Button
  submitButton: {
    backgroundColor: colors.primary, // bg-blue-600
    borderRadius: radius.lg, // rounded-xl
    paddingVertical: spacing.md, // py-4
    marginTop: spacing.xl, // mt-6
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
    ...typography.h4, // text-lg
    marginLeft: spacing.sm, // ml-2
  },
});

export default EMRGenerationScreen;