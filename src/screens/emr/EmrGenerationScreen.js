import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  Alert,
  StatusBar,
  Animated, 
  Easing,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Sound from 'react-native-nitro-sound';
import { colors, spacing, typography, radius, shadows } from '../../Constants/theme';
import {
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import RNFS from 'react-native-fs';

import { useAiTranscriptionMutation, useSaveEmrDataMutation, useVisitCompleteMutation, useEmrDataQuery, useUnsignEmrMutation, useUpdateVisitStatusMutation } from '../../hooks/useEmr';
import { AI_API_CONFIG } from '../../api/aiApi';
import { 
  Mic, MicOff, ChevronLeft, Trash2, Activity, Edit3, CheckCircle, Clock, FileText,
  Shield, Info, Loader, Hash, Calendar, Zap, List, Plus, X,
  ChevronDown,
  History,
  Save,
  LockOpen,
  RotateCcw,
  Thermometer
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import RouterConstants from '../../Constants/RouterConstants';

import { useToast } from '../../providers/ToastContext';

const DURATION_TYPES = ['days', 'weeks', 'months', 'years'];
const SEVERITY_TYPES = ['Mild', 'Moderate', 'Severe'];





// --- GLOBAL CONSTANTS ---
const VITALS_CONFIG = [
  { name: 'BP Systolic', unit: 'mmHg', min: 90, max: 120 },
  { name: 'BP Diastolic', unit: 'mmHg', min: 60, max: 80 },
  { name: 'Heart Rate', unit: 'bpm', min: 60, max: 100 },
  { name: 'Temperature', unit: '°F', allowedUnits: ['°F', '°C'], min: 97.0, max: 99.1 },
  { name: 'Respiratory Rate', unit: 'bpm', min: 12, max: 20 },
  { name: 'Height', unit: 'cm', allowedUnits: ['cm', 'ft'] },
  { name: 'Weight', unit: 'kg', allowedUnits: ['kg', 'lbs'] },
  { name: 'SpO2', unit: '%', min: 95, max: 100 },
];

const EMRGenerationScreen = () => {
  const route = useRoute();
  const patientData = route?.params?.patientData ||'';
  const { user } = useSelector((state) => state.auth);

  const {mutateAsync,isPending,data} = useSaveEmrDataMutation()
  const visitCompleteMutation = useVisitCompleteMutation();
  const unsignMutation = useUnsignEmrMutation();
  const updateStatusMutation = useUpdateVisitStatusMutation();

  const { data: fetchedEmrData, isLoading: isFetchingEmr, refetch: refetchEmr } = useEmrDataQuery({
    registrationId: patientData?.registrationId,
    visitId: patientData?.visitId || patientData?._id,
    facilityId: user?.facility?.facilityId
  });

  const [isEditing, setIsEditing] = useState(false);
  
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { height } = useWindowDimensions();
  const [audioData, setAudioData] = useState({ data: '', isRecording: false });
  const [selectedEndpoint, setSelectedEndpoint] = useState(AI_API_CONFIG.ENDPOINTS.TRANSCRIPTION);
  const aiTranscriptionMutation = useAiTranscriptionMutation();
  // --- Animation State ---
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // --- Core States ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [transcript, setTranscript] = useState('');
  const [lastRecordingPath, setLastRecordingPath] = useState(null);
  const [hasProcessingError, setHasProcessingError] = useState(false);
  const apiIsLoading =aiTranscriptionMutation.isPending
  const tabs = [
    'diagnosis', 'chiefComplaint', 'vitals', 'service', 'pharmacy', 'history', 
    'allergies', 'instructions', 'summary'
  ];
  
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [modalState, setModalState] = useState(null); 

  // Combined text fields - only used for history, summary, and instructions
  const [formText, setFormText] = useState({
    patientHistory:  '',
    familyHistory:  '',
    surgicalHistory:  '',
    instructions:  '',
    summary:  '',
  });

  const [structuredData, setStructuredData] = useState({
    pharmacy: [],
    allergies:  [],
    chiefComplaint:  [],
    diagnosis:  [],
    service:  [],
    vitals: VITALS_CONFIG.map(c => ({ name: c.name, value: '', unit: c.unit })),
  });

  // Populate data when fetched
  useEffect(() => {
    if (fetchedEmrData?.data) {
      const emr = fetchedEmrData.data;
      const emrDetails = emr.emrData || {};
      
      // isFormLocked was removed in favor of derived isFormLocked
      // setIsSigned(emr.visitStatus === 'SIGNED' || emr.visitStatus === 'DRAFT');
      
      // If the data changed, we might want to reset isEditing if the status is no longer DRAFT/SIGNED
      if (emr.visitStatus !== 'DRAFT' && emr.visitStatus !== 'SIGNED') {
        setIsEditing(true); 
      }

      setFormText({
        patientHistory: emrDetails.patientHistory || '',
        familyHistory: emrDetails.familyHistory || '',
        surgicalHistory: emrDetails.surgicalHistory || '',
        instructions: emrDetails.instructions?.map(i => i.generalInstructions).join('\n') || '',
        summary: emrDetails.summary || '',
      });

      // Map API names to component names
      const mappedAllergies = emrDetails.allergies?.map(a => ({
        ...a,
        allergiesName: a.allergenName || a.allergiesName // Support both for safety
      })) || [];

      // Map API vitals or fill defaults
      const apiVitals = emrDetails.vitals || [];
      const updatedVitals = VITALS_CONFIG.map(config => {
        const found = apiVitals.find(v => v.name === config.name);
        return found ? found : { name: config.name, value: '', unit: config.unit };
      });

      setStructuredData({
        pharmacy: emrDetails.pharmacy || [],
        allergies: mappedAllergies,
        chiefComplaint: emrDetails.chiefComplaint || [],
        diagnosis: emrDetails.diagnosis || [],
        service: emrDetails.service || [],
        vitals: updatedVitals,
      });
      
      if (emrDetails.transcription) {
        setTranscript(emrDetails.transcription);
      }
    }
  }, [fetchedEmrData]);

  const handleUnsign = async () => {
    try {
      const response = await updateStatusMutation.mutateAsync({
        visitId: patientData?.visitId || patientData?._id,
        visitStatus: 'DRAFT'
      });

      if (response && response.statusCode === 200) {
        showToast('EMR status updated to DRAFT. You can now click Edit Record.', 'success');
        refetchEmr();
      } else {
        showToast(response?.message || 'Failed to update visit status.', 'error');
      }
    } catch (error) {
      console.error("Update Status Error:", error);
      showToast(error.message || 'An error occurred while updating status.', 'error');
    }
  };

  const handleEditRecord = () => {
    setIsEditing(true);
    showToast('Editing enabled.', 'info');
  };

  const isFormLocked = (fetchedEmrData?.data?.visitStatus === 'SIGNED' || fetchedEmrData?.data?.visitStatus === 'DRAFT') && !isEditing;

  // --- Animation Setup (unchanged) ---
  useEffect(() => {
    const rotate = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true, }).start(() => rotate());
    };
    const pulse = () => {
        opacityAnim.setValue(0);
        Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true, }),
            Animated.timing(opacityAnim, { toValue: 0.3, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true, }),
        ]).start(() => pulse());
    };
    rotate();
    pulse();
  }, [rotateAnim, opacityAnim]);

  const rotateInterpolate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const animatedStyle = { transform: [{ rotate: rotateInterpolate }] }
  // --- End Animation Setup ---


  const getVitalStatus = (name, value, unit) => {
    if (!value || isNaN(value)) return null;
    const config = VITALS_CONFIG.find(c => c.name === name);
    if (!config || config.min === undefined) return null;
    
    let val = parseFloat(value);
    
    // Normalize Temperature to F for range checking
    if (name === 'Temperature' && unit === '°C') {
      val = (val * 9/5) + 32;
    }
    
    if (val < config.min) return { label: 'Low', color: '#EF4444' };
    if (val > config.max) return { label: 'Abnormal', color: '#EF4444' };
    return { label: 'Normal', color: '#10B981' };
  };

  const calculateBMI = useCallback(() => {
    const heightVital = structuredData.vitals.find(v => v.name === 'Height') || { value: '', unit: 'cm' };
    const weightVital = structuredData.vitals.find(v => v.name === 'Weight') || { value: '', unit: 'kg' };
    
    let h = parseFloat(heightVital.value);
    let w = parseFloat(weightVital.value);
    
    if (!h || !w || h === 0) return null;
    
    // Normalize Height to cm
    if (heightVital.unit === 'ft') {
      h = h * 30.48; // Simple ft to cm
    }
    const heightInMeters = h / 100;

    // Normalize Weight to kg
    if (weightVital.unit === 'lbs') {
      w = w * 0.453592;
    }
    
    const bmi = w / (heightInMeters * heightInMeters);
    const roundedBmi = bmi.toFixed(1);
    
    let status = { label: 'Normal', color: '#10B981' };
    if (bmi < 18.5) status = { label: 'Underweight', color: '#F59E0B' };
    else if (bmi >= 18.5 && bmi < 25) status = { label: 'Normal', color: '#10B981' };
    else if (bmi >= 25 && bmi < 30) status = { label: 'Overweight', color: '#F59E0B' };
    else if (bmi >= 30) status = { label: 'Obese', color: '#EF4444' };
    
    return { value: roundedBmi, ...status };
  }, [structuredData.vitals]);
  // --- VOICE/AUDIO LOGIC ---
  const checkPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
        const statuses = await requestMultiple([
            PERMISSIONS.ANDROID.RECORD_AUDIO,
        ]);
        return statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED;
    } else { // iOS
        const statuses = await requestMultiple([
            PERMISSIONS.IOS.MICROPHONE,
        ]);
        return statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.GRANTED;
    }
  }, []);

  const startRecording = useCallback(async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      showToast("Microphone access is required for recording.", "warning");

      return;
    }

    try {
      // Setup Sound recorder options
      Sound.setCategory('Record');
      Sound.setRecordingOptions({
        SampleRate: 44100,
        Channels: 1,
        AudioQuality: 'High',
        AudioEncoding: 'aac',
      });
      
      // Note: In a real app, you would check if the recorder is ready before starting
      await Sound.startRecorder(audioPath); 
      setIsRecording(true);
      setTranscript('Listening... Speak clearly. Tap the mic to stop.');
    } catch (error) {
      showToast(`Failed to start recording: ${error.message}`, "error");

      setIsRecording(false);
    }
  }, [checkPermissions]);
  const stopRecording = async () => {
    try {
      const filePath = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      
      setLastRecordingPath(filePath);
      setHasProcessingError(false);
      
      // START PROCESSING
      setIsProcessing(true); 
      setAudioData(prev => ({ ...prev, isRecording: false }));
      setTranscript('Audio recorded. Analyzing consultation...'); 
      
      const base64Audio = await RNFS.readFile(filePath, 'base64');
  
      try {
        const aiResult = await aiTranscriptionMutation.mutateAsync({ 
          base64AudioString: base64Audio, 
          endpoint: selectedEndpoint 
        });
        
        if (aiResult) {
          setTranscript(aiResult.transcription || '');
          setStructuredData({
            pharmacy: aiResult?.pharmacy || [],
            allergies: aiResult.allergies || [],
            chiefComplaint: aiResult.chiefComplaint || [],
            diagnosis: aiResult.diagnosis || [],
            service: aiResult.service || [],
          });

          setFormText({
            patientHistory: aiResult?.patientHistory ,
            familyHistory: aiResult?.familyHistory,
            surgicalHistory: aiResult?.surgicalHistory,
            instructions: aiResult?.instructions?.map(i => i.generalInstructions).join('\n') || '',
            summary: aiResult?.summary,
          });
          
          showToast("EMR fields populated.", "success");
          // On success, we can safely delete the file
          const fileExists = await RNFS.exists(filePath);
          if (fileExists) await RNFS.unlink(filePath);
          setLastRecordingPath(null);
        }
      } catch (aiError) {
        console.error(aiError);
        setTranscript('AI processing failed. You can retry using the button below.');
        setHasProcessingError(true);
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Recording error:', error);
      setIsProcessing(false);
      setHasProcessingError(true);
    }
  };

  const handleRetryTranscription = async () => {
    if (!lastRecordingPath) {
      showToast("No recording found to retry.", "warning");
      return;
    }

    try {
      setIsProcessing(true);
      setHasProcessingError(false);
      setTranscript('Retrying analysis...');

      const base64Audio = await RNFS.readFile(lastRecordingPath, 'base64');
      
      const aiResult = await aiTranscriptionMutation.mutateAsync({ 
        base64AudioString: base64Audio, 
        endpoint: selectedEndpoint 
      });

      if (aiResult) {
        setTranscript(aiResult.transcription || '');
        setStructuredData({
          pharmacy: aiResult?.pharmacy || [],
          allergies: aiResult.allergies || [],
          chiefComplaint: aiResult.chiefComplaint || [],
          diagnosis: aiResult.diagnosis || [],
          service: aiResult.service || [],
        });

        setFormText({
          patientHistory: aiResult?.patientHistory,
          familyHistory: aiResult?.familyHistory,
          surgicalHistory: aiResult?.surgicalHistory,
          instructions: aiResult?.instructions?.map(i => i.generalInstructions).join('\n') || '',
          summary: aiResult?.summary,
        });

        showToast("EMR fields populated successfully.", "success");
        
        // Clean up
        const fileExists = await RNFS.exists(lastRecordingPath);
        if (fileExists) await RNFS.unlink(lastRecordingPath);
        setLastRecordingPath(null);
      }
    } catch (error) {
      console.error('Retry error:', error);
      setTranscript('Retry failed. Please try again or record a new consultation.');
      setHasProcessingError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecordingd = useCallback(async () => {
    try {
      // Note: In a real app, you would check if the recorder is running before stopping
      await Sound.stopRecorder(); 
      setIsRecording(false);
      setIsProcessing(true);
      
      // MOCK API CALL & RESPONSE
      setTimeout(() => {
        // Mock successful transcription and parsing
        const mockResponse = [];
        
        setTranscript(mockResponse.transcription);
        setFormText({
            patientHistory: mockResponse.patientHistory,
            familyHistory: mockResponse.familyHistory,
            surgicalHistory: mockResponse.surgicalHistory,
            instructions: mockResponse.instructions?.map(i => i.generalInstructions).join('\n') || '',
            summary: mockResponse.summary,
        });
        setStructuredData({
            pharmacy: mockResponse.pharmacy,
            allergies: mockResponse.allergies,
            chiefComplaint: mockResponse.chiefComplaint,
            diagnosis: mockResponse.diagnosis,
            service: mockResponse.service,
        });

        setIsProcessing(false);
        showToast("EMR fields populated from transcription.", "success");


        // Clean up audio file (Mocked)
        // await RNFS.unlink(audioPath); 
      }, 3000);

    } catch (error) {
      showToast(`Failed to stop recording: ${error.message}`, "error");

      setIsRecording(false);
      setIsProcessing(false);
    }
  }, []);

  const handleRecordAudio = async () => {
    // ... Permission logic same as before ...
    let permissionsGranted = false;
    try {
        const permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.MICROPHONE;
        const statuses = await requestMultiple([permission]);
        if (statuses[permission] === RESULTS.GRANTED) permissionsGranted = true;
    } catch (e) {}

    if(permissionsGranted) {
        if (audioData.isRecording) {
            await stopRecording();
        } else {
            Alert.alert(
              "Select Language",
              "Which language option would you like to use?",
              [
                {
                  text: "English Only",
                  onPress: async () => {
                    setSelectedEndpoint(AI_API_CONFIG.ENDPOINTS.TRANSCRIPTION);
                    setAudioData({ ...audioData, isRecording: true });
                    await Sound.startRecorder();
                  }
                },
                {
                  text: "Multi-language (Odia/English)",
                  onPress: async () => {
                    setSelectedEndpoint(AI_API_CONFIG.ENDPOINTS.TRANSCRIPTION_MULTI);
                    setAudioData({ ...audioData, isRecording: true });
                    await Sound.startRecorder();
                  }
                },
                {
                  text: "Cancel",
                  style: "cancel"
                }
              ]
            );
        }
    }
  };

  // --- EMR LOGIC ---

  const getTabLabel = (key) => {
    switch(key) {
      case 'history': return 'History';
      case 'chiefComplaint': return 'Symptoms';
      case 'pharmacy': return 'Medications';
      case 'vitals': return 'Vitals';
      default: return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  const removeItem = (category, index) => {
    const updatedList = [...structuredData[category]];
    updatedList.splice(index, 1);
    setStructuredData(prev => ({...prev, [category]: updatedList}));
  };
  
  const handleSaveItem = (category, mode, index, newItem) => {
    setStructuredData(prev => {
      const updatedList = [...prev[category]];
      if (mode === 'add') {
        updatedList.push(newItem);
      } else if (mode === 'edit' && index !== undefined) {
        updatedList[index] = newItem;
      }
      return {...prev, [category]: updatedList};
    });
    setModalState(null);
  };

  const handleSubmit = async (type = 'DRAFT') => {
    // Helper to parser integer or float
    const parseNumber = (val) => {
        if (!val) return 0;
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    // Process structured data to match API requirements
    const processedPharmacy = structuredData.pharmacy.map(p => ({
        ...p,
        dosageAmount: parseNumber(p.dosageAmount),
        duration: parseNumber(p.duration),
        dosageUnit: p.dosageUnit || 'tablet', 
        durationType: p.durationType || 'days',
    }));

    const processedChiefComplaint = structuredData.chiefComplaint.map(c => ({
        ...c,
        duration: parseNumber(c.duration),
        severity: c.severity || 'Mild',
        durationType: c.durationType || 'days', 
    }));

    const finalJSON = {
        ...structuredData,
        pharmacy: processedPharmacy,
        chiefComplaint: processedChiefComplaint,
        patientHistory: formText.patientHistory || "",
        familyHistory: formText.familyHistory || "",
        surgicalHistory: formText.surgicalHistory || "",
        summary: formText.summary || "",
        instructions: [{ generalInstructions: formText.instructions || "" }],
        patientCondition: [{ condition: "Stable" }],
        transcription: transcript || "" 
    };

    try {
      // Step 1: Save EMR Data
      const response = await mutateAsync({
        registrationId: patientData?.registrationId,
        visitId: patientData?.visitId || patientData?._id,
        facilityId: user?.facility?.facilityId,
        emrData : {...finalJSON}
      });

      if (response && response.statusCode === 200) {
        // Step 2: Update Visit Status
        const statusRes = await updateStatusMutation.mutateAsync({
          visitId: patientData?.visitId || patientData?._id,
          visitStatus: type === 'CHECKIN' ? 'SIGNED' : 'DRAFT'
        });

        if (statusRes && statusRes.statusCode === 200) {
          showToast(`EMR ${type === 'CHECKIN' ? 'Signed' : 'Draft saved'} successfully.`, 'success');
          setIsEditing(false);
          refetchEmr();
        } else {
          showToast(statusRes?.message || 'EMR saved but status update failed.', 'warning');
        }
      } else {
        showToast(response?.message || 'Failed to save EMR data.', 'error');
      }
    } catch (error) {
      console.error("Submit Error:", error);
      showToast(error.message || 'An error occurred during submission.', 'error');
    }
  };

  // --- REUSABLE COMPONENTS ---

  const CardContainer = ({ children, headerIcon, headerText, onDelete, onEdit }) => (
    <TouchableOpacity 
        onPress={isFormLocked ? null : onEdit} 
        disabled={!onEdit || isFormLocked}
    >
        <View style={styles.listItemCard}>
            <View style={styles.cardHeader}>
                <View style={styles.itemIconContainer}>
                    {headerIcon}
                </View>
                <Text style={styles.cardTitle}>{headerText}</Text>
                {!isFormLocked && onDelete && (
                <TouchableOpacity onPress={onDelete} style={{padding: 4}}>
                    <Trash2 size={16} color={colors.gray400} />
                </TouchableOpacity>
                )}
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardDetails}>
                {children}
            </View>
        </View>
    </TouchableOpacity>
  );

  const CustomDropdown = ({ label, options, selectedValue, onSelect, placeholder, style, zIndex }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <View style={[styles.dropdownContainer, style, { zIndex: isOpen ? (zIndex || 1000) : (zIndex || 1) }]}>
            <Text style={styles.formLabel}>{label}</Text>
            <TouchableOpacity 
                style={styles.dropdownButton} 
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={[styles.dropdownText, !selectedValue && { color: colors.gray400 }]}>
                    {selectedValue || placeholder}
                </Text>
                <ChevronDown size={14} color={colors.gray500} style={{ transform: [{ rotate: isOpen ? '-90deg' : '0deg' }] }} />
            </TouchableOpacity>
            {isOpen && (
                <View style={[styles.dropdownOptions, { zIndex: zIndex || 1000 }]}>
                    <ScrollView 
                        keyboardShouldPersistTaps="handled" 
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        {options.map((option) => (
                            <TouchableOpacity 
                                key={option} 
                                style={styles.dropdownOption}
                                onPress={() => { onSelect(option); setIsOpen(false); }}
                            >
                                <Text style={styles.dropdownOptionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
  };

  const ItemForm = ({ category, mode, index, initialData = {}, onSave, onCancel }) => {
    // Ensure that if initialData fields are missing (e.g., from older mock data), 
    // we initialize them as empty strings to avoid uncontrolled/unhandled inputs.
    const getInitialState = useCallback(() => {
        const base = initialData || {};
        switch(category) {
            case 'chiefComplaint':
                return { complaintName: '', duration: '', durationType: '', severity: '', ...base };
            case 'pharmacy':
                return { medicineName: '', dosageAmount: '', dosageUnit: '', duration: '', durationType: '', frequency: '', instructions: '', ...base };
            case 'service':
                return { testOrServiceName: '', instructions: '', dateAndTime: '', ...base };
            case 'allergies':
                return { allergenName: '', icdCode: '', ...base };
            case 'diagnosis':
                return { diagnosisName: '', icdCode: '', ...base };
            default:
                return base;
        }
    }, [category, initialData]);

    const [tempItem, setTempItem] = useState(getInitialState);

    const getFields = useCallback(() => {
        // Dynamically assign zIndex based on field order to handle dropdown layering, 
        // especially for two-column layouts where the right column might overlap the left.
        let baseFields;
        switch(category) {
            case 'diagnosis': 
              baseFields = [
                { key: 'diagnosisName', label: 'Diagnosis Name', placeholder: 'e.g., Gastritis', required: true, width: '100%' },
                { key: 'icdCode', label: 'ICD Code (Optional)', placeholder: 'e.g., K29.0', width: '100%' },
              ];
              break;
            case 'chiefComplaint': 
              baseFields = [
                { key: 'complaintName', label: 'Symptom Name', placeholder: 'e.g., Acidity issues', required: true, width: '100%' },
                { key: 'severity', label: 'Severity', placeholder: 'Select Severity', isDropdown: true, options: SEVERITY_TYPES, width: '100%' },
                { key: 'duration', label: 'Duration Amount', placeholder: 'e.g., 3', isNumber: true, width: '40%' },
                { key: 'durationType', label: 'Duration Unit', placeholder: 'Select Unit', isDropdown: true, options: DURATION_TYPES, width: '60%' },
              ];
              break;
            case 'pharmacy':
              baseFields = [
                { key: 'medicineName', label: 'Medicine Name', placeholder: 'e.g., Antacid S', required: true, width: '100%' },
                { key: 'dosageAmount', label: 'Dosage Amount', placeholder: 'e.g., 10', isNumber: true, width: '50%' },
                { key: 'dosageUnit', label: 'Dosage Unit', placeholder: 'e.g., mg/ml', width: '50%' },
                { key: 'frequency', label: 'Frequency', placeholder: 'e.g., twice daily', width: '100%' },
                { key: 'duration', label: 'Duration Amount (Rx)', placeholder: 'e.g., 7', isNumber: true, width: '40%' },
                { key: 'durationType', label: 'Duration Unit (Rx)', placeholder: 'Select Unit', isDropdown: true, options: DURATION_TYPES, width: '60%' },
                { key: 'instructions', label: 'Instructions', placeholder: 'e.g., take after meals', isMultiline: true, width: '100%' },
              ];
              break;
            case 'service':
              baseFields = [
                { key: 'testOrServiceName', label: 'Test/Service Name', placeholder: 'e.g., basic blood test', required: true, width: '100%' },
                { key: 'instructions', label: 'Instructions/Purpose', placeholder: 'e.g., General health check', isMultiline: true, width: '100%' },
                { key: 'dateAndTime', label: 'Date/Time (Optional)', placeholder: 'e.g., after one week', width: '100%' },
              ];
              break;
              break;
            case 'allergies':
                baseFields = [
                    { key: 'allergiesName', label: 'Allergy Name', placeholder: 'e.g., Codeine', required: true, width: '100%' },
                    { key: 'icdCode', label: 'ICD Code (Optional)', placeholder: 'e.g., T40.2X5A', width: '100%' },
                ];
                break;
            default: 
                baseFields = [];
        }
        
        // Assign zIndex for dropdowns: Higher index means it stays on top.
        const totalFields = baseFields.length;
        return baseFields.map((field, index) => ({
            ...field,
            // Assign a high zIndex for dropdowns, decreasing with field index
            // Use much higher zIndex values to ensure they appear above other elements
            zIndex: field.isDropdown ? 1000 - index : 1, 
        }));

    }, [category]);

    const handleSave = () => {
      const fields = getFields();
      
      // Validation: Check required fields are not empty strings after trimming
      const isValid = fields.filter(f => f.required).every(f => tempItem[f.key] && tempItem[f.key].toString().trim() !== '');
      
      if (!isValid) {
        showToast(`Please enter all required fields for ${getTabLabel(category)}.`, "warning");

        return;
      }

      // Final Item construction: Ensure all JSON keys are present, even if empty strings
      const finalItem = fields.reduce((acc, field) => {
        acc[field.key] = tempItem[field.key] || (field.isNumber ? "" : "");
        return acc;
      }, { ...tempItem });
      
      onSave(category, mode, index, finalItem);
    };

    const fields = getFields();
    const title = mode === 'edit' ? `Edit ${getTabLabel(category)} Item` : `Add New ${getTabLabel(category)}`;
    const saveButtonText = mode === 'edit' ? 'Save Changes' : 'Add Item';
    const cancelButtonText = 'Cancel';
    
    return (
      <View style={styles.formModalContent}>
        <View style={styles.formModalHeader}>
          <Text style={styles.formModalTitle}>{title}</Text>
          <TouchableOpacity onPress={onCancel}>
            <X size={20} color={colors.gray600} />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={{paddingBottom: 20}} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, maxHeight: height * 0.7 }}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 5}}>
            {fields.map((field) => {
                // Calculate wrapper width, accounting for 5% margin/spacing for two columns
                const wrapperWidth = field.width === '100%' ? '100%' : field.width ? `${parseFloat(field.width) - 5}%` : '48%';

                const renderInput = () => {
                    if (field.isDropdown) {
                        return (
                          
                            <CustomDropdown
                                label={field.label}
                                options={field.options}
                                selectedValue={tempItem[field.key]}
                                onSelect={(value) => setTempItem(prev => ({...prev, [field.key]: value}))}
                                placeholder={field.placeholder}
                                zIndex={field.zIndex}
                            />
                        );
                    }
                    
                    return (
                        <>
                            <Text style={styles.formLabel}>
                              {field.label} {field.required && <Text style={{color: colors.error}}>*</Text>}
                            </Text>
                            <TextInput
                                style={[styles.formInput, field.isMultiline && styles.multilineInput]}
                                placeholder={field.placeholder}
                                placeholderTextColor={colors.gray400}
                                onChangeText={(text) => setTempItem(prev => ({...prev, [field.key]: text}))}
                                keyboardType={field.isNumber ? 'numeric' : 'default'}
                                value={tempItem[field.key]}
                                multiline={field.isMultiline}
                                textAlignVertical={field.isMultiline ? 'top' : 'center'}
                            />
                        </>
                    );
                };

                return (
                    // Apply zIndex only to the wrapper for dropdowns to ensure the entire field appears above others
                    <View key={field.key} style={[
                        styles.formFieldWrapper, 
                        { 
                            width: wrapperWidth, 
                            zIndex: field.isDropdown ? field.zIndex : 1,
                            overflow: field.isDropdown ? 'visible' : 'hidden'
                        }
                    ]}>
                        {renderInput()}
                    </View>
                );
            })}
          </View>
        </ScrollView>
        <View style={styles.formButtonRow}>
          <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{saveButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const ActionModalWrapper = () => {
    if (!modalState) return null;
  
    const { category, mode, index, data } = modalState;
  
    return (
      <Modal
        animationType="slide"
        transparent
        visible
        onRequestClose={() => setModalState(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          {/* Tap outside to close */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalState(null)}
          />
  
          {/* Modal Sheet */}
          <View style={styles.modalSheet}>
            <ItemForm
              category={category}
              mode={mode}
              index={index}
              initialData={data}
              onSave={handleSaveItem}
              onCancel={() => setModalState(null)}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  

  // --- RENDERERS ---

  const renderStructuredView = (category, listRenderer) => {
    if (!['diagnosis', 'chiefComplaint', 'service', 'pharmacy', 'allergies', 'vitals'].includes(category)) return null;

    return (
        <>
            <TouchableOpacity 
                style={[styles.addButton, isFormLocked && styles.disabledBtn]} 
                onPress={() => !isFormLocked && setModalState({ category, mode: 'add', index: undefined, data: {} })}
                disabled={isFormLocked}
            >
                <Plus size={16} color={colors.primary} style={{marginRight: 6}}/>
                <Text style={styles.addButtonText}>
                    {`Add New ${getTabLabel(category)}`}
                </Text>
            </TouchableOpacity>
            {listRenderer()}
        </>
    );
  };
  
  const renderVitalsForm = () => {
    const bmiRes = calculateBMI();
    
    // Separate BP and others
    const bpSystolic = structuredData.vitals.find(v => v.name === 'BP Systolic') || { value: '' };
    const bpDiastolic = structuredData.vitals.find(v => v.name === 'BP Diastolic') || { value: '' };
    const otherVitals = VITALS_CONFIG.filter(c => !['BP Systolic', 'BP Diastolic'].includes(c.name));

    const sbpStatus = getVitalStatus('BP Systolic', bpSystolic.value);
    const dbpStatus = getVitalStatus('BP Diastolic', bpDiastolic.value);

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Patient Vitals Indicators</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
          
          {/* Combined BP Card */}
          <View style={styles.vitalCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vitalName}>BP (Sys/Dia)</Text>
              <View style={styles.vitalInputRow}>
                <TextInput
                  style={[styles.vitalValueInput, { color: sbpStatus?.color || colors.gray900 }, { minWidth: 35, textAlign: 'right' }]}
                  value={bpSystolic.value}
                  onChangeText={(val) => {
                    const updated = structuredData.vitals.map(v => v.name === 'BP Systolic' ? { ...v, value: val } : v);
                    setStructuredData(prev => ({ ...prev, vitals: updated }));
                  }}
                  placeholder="--"
                  keyboardType="numeric"
                  editable={!isFormLocked}
                />
                <Text style={[styles.vitalValue, { fontSize: 18, marginHorizontal: 2, color: colors.gray400 }]}>/</Text>
                <TextInput
                  style={[styles.vitalValueInput, { color: dbpStatus?.color || colors.gray900 }, { minWidth: 35, textAlign: 'left' }]}
                  value={bpDiastolic.value}
                  onChangeText={(val) => {
                    const updated = structuredData.vitals.map(v => v.name === 'BP Diastolic' ? { ...v, value: val } : v);
                    setStructuredData(prev => ({ ...prev, vitals: updated }));
                  }}
                  placeholder="--"
                  keyboardType="numeric"
                  editable={!isFormLocked}
                />
                <Text style={[styles.vitalUnitLabel, { marginLeft: 4 }]}>mmHg</Text>
              </View>
            </View>
          </View>

          {/* Other Vitals */}
          {otherVitals.map((config) => {
            const vital = structuredData.vitals.find(v => v.name === config.name) || { name: config.name, value: '', unit: config.unit };
            const status = getVitalStatus(config.name, vital.value, vital.unit);
            
            return (
              <View key={config.name} style={[styles.vitalCard, isFormLocked && { opacity: 0.8 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vitalName}>{config.name}</Text>
                  <View style={styles.vitalInputRow}>
                    <TextInput
                      style={[styles.vitalValueInput, { color: status?.color || colors.gray900 }]}
                      value={vital.value}
                      onChangeText={(val) => {
                        const updated = structuredData.vitals.map(v => 
                          v.name === config.name ? { ...v, value: val } : v
                        );
                        setStructuredData(prev => ({ ...prev, vitals: updated }));
                      }}
                      placeholder="--"
                      keyboardType="numeric"
                      maxLength={5}
                      editable={!isFormLocked}
                    />
                    {config.allowedUnits ? (
                      <TouchableOpacity 
                        onPress={() => {
                          if (isFormLocked) return;
                          const nextUnit = config.allowedUnits.find(u => u !== vital.unit);
                          let nextValue = vital.value;
                          
                          if (vital.value && !isNaN(vital.value)) {
                            const val = parseFloat(vital.value);
                            if (config.name === 'Height') {
                              nextValue = nextUnit === 'ft' ? (val * 0.0328084).toFixed(2) : (val / 0.0328084).toFixed(1);
                            } else if (config.name === 'Weight') {
                              nextValue = nextUnit === 'lbs' ? (val * 2.20462).toFixed(1) : (val / 2.20462).toFixed(1);
                            } else if (config.name === 'Temperature') {
                              nextValue = nextUnit === '°C' ? ((val - 32) * 5/9).toFixed(1) : ((val * 9/5) + 32).toFixed(1);
                            }
                          }

                          const updated = structuredData.vitals.map(v => 
                            v.name === config.name ? { ...v, unit: nextUnit, value: nextValue.toString() } : v
                          );
                          setStructuredData(prev => ({ ...prev, vitals: updated }));
                        }}
                        style={styles.unitToggle}
                      >
                         <Text style={styles.vitalUnitLabel}>{vital.unit}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.vitalUnitLabel}>{config.unit}</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          
          {/* BMI Card */}
          {bmiRes && (
            <View style={[styles.vitalCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
               <View style={{ flex: 1 }}>
                  <Text style={[styles.vitalName, { color: '#0369A1' }]}>Body Mass Index (BMI)</Text>
                  <View style={styles.vitalInputRow}>
                    <Text style={[styles.vitalValue, { fontSize: 22, color: bmiRes.color }]}>{bmiRes.value}</Text>
                    <Text style={[styles.vitalUnitLabel, { marginLeft: 6 }]}>kg/m²</Text>
                  </View>
                </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // 1. Symptoms/Chief Complaint List
  const renderSymptomsList = () => {
    if (!structuredData.chiefComplaint || structuredData.chiefComplaint.length === 0) return (
      <Text style={styles.emptyListText}>No symptoms recorded yet.</Text>
    );

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Recorded Symptoms (Tap to Edit)</Text>
        {structuredData.chiefComplaint.map((item, index) => (
          <CardContainer 
            key={index} 
            headerIcon={<Zap size={20} color={colors.red500} />} 
            headerText={item.complaintName}
            onDelete={() => removeItem('chiefComplaint', index)}
            onEdit={() => setModalState({ category: 'chiefComplaint', mode: 'edit', index, data: item })}
          >
            {item.severity && (
                <View style={styles.cardRow}>
                    <Activity size={14} color={colors.gray500} style={styles.rowIcon} />
                    <Text style={styles.cardLabel}>Severity: </Text>
                    <Text style={styles.cardValue}>{item.severity}</Text>
                </View>
             )}
            {(item.duration || item.durationType) && (
              <View style={styles.cardRow}>
                <Clock size={14} color={colors.gray500} style={styles.rowIcon} />
                <Text style={styles.cardLabel}>Duration: </Text>
                <Text style={styles.cardValue}>{`${item.duration || 'N/A'} ${item.durationType || ''}`}</Text>
              </View>
            )}
          </CardContainer>
        ))}
      </View>
    );
  };

  // 2. Diagnosis List
  const renderDiagnosisList = () => {
    if (!structuredData.diagnosis || structuredData.diagnosis.length === 0) return (
        <Text style={styles.emptyListText}>No diagnosis recorded yet.</Text>
    );

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Final Diagnosis (Tap to Edit)</Text>
        {structuredData.diagnosis.map((item, index) => (
          <CardContainer 
            key={index} 
            headerIcon={<CheckCircle size={20} color={colors.green600} />} 
            headerText={item.diagnosisName}
            onDelete={() => removeItem('diagnosis', index)}
            onEdit={() => setModalState({ category: 'diagnosis', mode: 'edit', index, data: item })}
          >
            {item.icdCode && (
              <View style={styles.cardRow}>
                <Hash size={14} color={colors.gray500} style={styles.rowIcon} />
                <Text style={styles.cardLabel}>ICD-10 Code: </Text>
                <Text style={styles.cardValue}>{item.icdCode}</Text>
              </View>
            )}
          </CardContainer>
        ))}
      </View>
    );
  };
  
  // 3. Service/Test List
  const renderServiceList = () => {
    if (!structuredData.service || structuredData.service.length === 0) return (
        <Text style={styles.emptyListText}>No services/tests recorded yet.</Text>
    );

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Recommended Tests & Follow-ups (Tap to Edit)</Text>
        {structuredData.service.map((item, index) => (
          <CardContainer 
            key={index} 
            headerIcon={<List size={20} color={colors.teal500} />} 
            headerText={item.testOrServiceName}
            onDelete={() => removeItem('service', index)}
            onEdit={() => setModalState({ category: 'service', mode: 'edit', index, data: item })}
          >
            {item.instructions && (
              <View style={styles.cardRow}>
                <Info size={14} color={colors.gray500} style={styles.rowIcon} />
                <Text style={styles.cardLabel}>Purpose: </Text>
                <Text style={styles.cardValue}>{item.instructions}</Text>
              </View>
            )}
            {item.dateAndTime && (
               <View style={styles.cardRow}>
                <Calendar size={14} color={colors.gray500} style={styles.rowIcon} />
                <Text style={styles.cardLabel}>When: </Text>
                <Text style={styles.cardValue}>{item.dateAndTime}</Text>
              </View>
            )}
          </CardContainer>
        ))}
      </View>
    );
  };
  // 4. Pharmacy List 
  const renderPharmacyList = () => {
    if (!structuredData.pharmacy || structuredData.pharmacy.length === 0) return (
        <Text style={styles.emptyListText}>No medications prescribed yet.</Text>
    );

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Prescribed Medications (Tap to Edit)</Text>
        {structuredData.pharmacy.map((item, index) => (
           <CardContainer 
            key={index} 
            headerIcon={<Activity size={20} color={colors.primary} />} 
            headerText={item.medicineName}
            onDelete={() => removeItem('pharmacy', index)}
            onEdit={() => setModalState({ category: 'pharmacy', mode: 'edit', index, data: item })}
          >
            {(item.dosageAmount || item.dosageUnit) && (
              <View style={styles.cardRow}>
                <List size={14} color={colors.gray500} style={styles.rowIcon} />
                <Text style={styles.cardLabel}>Dose: </Text>
                <Text style={styles.cardValue}>{`${item.dosageAmount || ''} ${item.dosageUnit || ''}`}</Text>
              </View>
            )}
            
            <View style={styles.cardRow}>
              <Clock size={14} color={colors.gray500} style={styles.rowIcon} />
              <Text style={styles.cardLabel}>Frequency: </Text>
              <Text style={styles.cardValue}>{item.frequency || 'N/A'}</Text>
            </View>

            {(item.duration || item.durationType) && (
              <View style={styles.cardRow}>
                <Calendar size={14} color={colors.gray500} style={styles.rowIcon} />
                <Text style={styles.cardLabel}>Duration: </Text>
                <Text style={styles.cardValue}>{`${item.duration || ''} ${item.durationType || ''}`}</Text>
              </View>
            )}
            
            <View style={styles.cardRow}>
              <FileText size={14} color={colors.gray500} style={styles.rowIcon} />
              <Text style={styles.cardLabel}>Instruction: </Text>
              <Text style={styles.cardValue}>{item.instructions || 'None'}</Text>
            </View>
          </CardContainer>
        ))}
      </View>
    );
  };

  // 5. Allergy List 
  const renderAllergyList = () => {
    if (!structuredData.allergies || structuredData.allergies.length === 0) return (
        <Text style={styles.emptyListText}>No allergies recorded yet.</Text>
    );

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Recorded Allergies (Tap to Edit)</Text>
        <View style={styles.chipContainer}>
          {structuredData.allergies.map((item, index) => (
            <TouchableOpacity 
                key={index} 
                style={styles.blueChip}
                onPress={() => setModalState({ category: 'allergies', mode: 'edit', index, data: item })}
            >
               <Shield size={14} color={colors.primary} style={{marginRight: 6}} />
               <View>
                 <Text style={styles.blueChipText}>{item.allergenName || item.allergiesName}</Text>
                 {item.icdCode && (
                    <Text style={styles.chipSubText}>{item.icdCode}</Text>
                 )}
               </View>
               <TouchableOpacity 
                  onPress={(e) => { 
                    e.stopPropagation(); // Prevent card press from firing when trash is pressed
                    removeItem('allergies', index); 
                  }} 
                  style={{marginLeft: 8, padding: 4}}
                >
                  <Trash2 size={14} color={colors.primary} opacity={0.6} />
               </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // 6. Processing View
  const renderProcessingView = () => (
    <View style={styles.processingContainer}>
      {/* <Animated.View style={[animatedStyle, {marginBottom: 10}]}>
        <Loader size={36} color={colors.primary} />
      </Animated.View> */}
      <Animated.Text style={[styles.processingText, {opacity: opacityAnim}]}>
        Analyzing Voice Data... Please wait.
      </Animated.Text>
      <Text style={styles.processingSubText}>
        Generating EMR fields, prescriptions, and summaries.
      </Text>
    </View>
  );

  // --- MAIN RENDER ---
  if (isFetchingEmr) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.gray600, fontWeight: '600' }}>Loading EMR Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
     
      {/* new header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>EMR</Text>
            <Text style={styles.headerSubtitle}>{patientData?.patientName || 'Patient EMR'}</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate(RouterConstants.PatientHistory,{patientData})}>
            <History size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.mainScroll} 
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Voice Recorder Section */}
          <View style={styles.voiceSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <View style={[styles.micRing, (audioData?.isRecording || isProcessing) && styles.micRingActive]}>
                <TouchableOpacity 
                  style={[styles.micButton, (audioData?.isRecording || isProcessing) && styles.micButtonRecording]}
                  onPress={handleRecordAudio}
                  disabled={isProcessing || apiIsLoading} 
                >
                  {isProcessing ? (
                    <Loader size={28} color={colors.white} />
                  ) : audioData?.isRecording ? (
                    <MicOff size={28} color={colors.white} />
                  ) : (
                    <Mic size={28} color={colors.white} />
                  )}
                </TouchableOpacity>
              </View>

              {hasProcessingError && !audioData?.isRecording && !isProcessing && (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={handleRetryTranscription}
                >
                  <RotateCcw size={24} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.recordingStatusText}>
              {isProcessing ? 'Processing consultation...' : 
               audioData?.isRecording ? 'Listening... Tap to stop' : 
               hasProcessingError ? 'Generation failed' : 'Consultation Voice Assistant'}
            </Text>
            {(isProcessing || apiIsLoading) ? renderProcessingView() : (transcript !== '' && (
              <View style={styles.transcriptBubble}>
                <Text style={styles.transcriptText} numberOfLines={2}>{transcript}</Text>
              </View>
            ))}
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => { setActiveTab(tab); setModalState(null); }} // Close modal on tab change
                  style={[ styles.tabPill, activeTab === tab && styles.tabPillActive, ]}
                >
                  <Text style={[ styles.tabText, activeTab === tab && styles.tabTextActive, ]}>
                    {getTabLabel(tab)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content Area */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
               <View style={styles.sectionHeaderRow}>
                 <Text style={styles.sectionTitle}>{getTabLabel(activeTab)}</Text>
                 <Edit3 size={16} color={colors.gray400} />
               </View>

               {/* History Section - Consolidated */}
               {activeTab === 'history' && (
                 <View style={{ gap: 16 }}>
                   <View>
                     <Text style={styles.formLabel}>Patient History</Text>
                     <TextInput
                       style={[styles.modernInput, isFormLocked && styles.readOnlyInput, { height: 80 }]}
                       placeholder="Enter patient history..."
                       placeholderTextColor={colors.gray400}
                       multiline
                       value={formText.patientHistory}
                       onChangeText={(text) => setFormText(prev => ({...prev, patientHistory: text}))}
                       editable={!isFormLocked}
                     />
                   </View>
                   <View>
                     <Text style={styles.formLabel}>Family History</Text>
                     <TextInput
                       style={[styles.modernInput, isFormLocked && styles.readOnlyInput, { height: 80 }]}
                       placeholder="Enter family history..."
                       placeholderTextColor={colors.gray400}
                       multiline
                       value={formText.familyHistory}
                       onChangeText={(text) => setFormText(prev => ({...prev, familyHistory: text}))}
                       editable={!isFormLocked}
                     />
                   </View>
                   <View>
                     <Text style={styles.formLabel}>Surgical History</Text>
                     <TextInput
                       style={[styles.modernInput, isFormLocked && styles.readOnlyInput, { height: 80 }]}
                       placeholder="Enter surgical history..."
                       placeholderTextColor={colors.gray400}
                       multiline
                       value={formText.surgicalHistory}
                       onChangeText={(text) => setFormText(prev => ({...prev, surgicalHistory: text}))}
                       editable={!isFormLocked}
                     />
                   </View>
                 </View>
               )}

               {/* Main Text Input for Instructions/Summary */}
               {['instructions', 'summary'].includes(activeTab) && (
                   <TextInput
                      style={[styles.modernInput, isFormLocked && styles.readOnlyInput]}
                      placeholder={`Enter ${getTabLabel(activeTab)} details...`}
                      placeholderTextColor={colors.gray400}
                      multiline
                      value={formText[activeTab]}
                      onChangeText={(text) => setFormText(prev => ({...prev, [activeTab]: text}))}
                      editable={!isFormLocked}
                    />
               )}

                {/* Structured List Views */}
                {activeTab === 'diagnosis' && renderStructuredView('diagnosis', renderDiagnosisList)}
                {activeTab === 'vitals' && renderVitalsForm()}
                {activeTab === 'chiefComplaint' && renderStructuredView('chiefComplaint', renderSymptomsList)}
                {activeTab === 'service' && renderStructuredView('service', renderServiceList)}
                {activeTab === 'pharmacy' && renderStructuredView('pharmacy', renderPharmacyList)}
                {activeTab === 'allergies' && renderStructuredView('allergies', renderAllergyList)}
                
                {activeTab === 'instructions' && (
                   <View style={styles.infoBox}>
                     <Text style={styles.infoBoxText}>
                       <Text style={{fontWeight:'700'}}>Tip: </Text>
                       Edit the text above. This content is for the patient's discharge summary/general instructions.
                     </Text>
                   </View>
                )}

            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* --- MODAL RENDER --- 
          CRITICAL FIX: This line renders the Modal component which conditionally
          displays the ItemForm when modalState is set (e.g., by clicking "Add New" or a card).
      */}
      <ActionModalWrapper />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {fetchedEmrData?.data?.visitStatus === 'SIGNED' && !isEditing ? (
          <TouchableOpacity 
            style={[styles.unsignBtn, updateStatusMutation.isPending && styles.disabledBtn]} 
            onPress={handleUnsign}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <ActivityIndicator color="#B45309" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'center' }}>
                <LockOpen size={18} color="#B45309" style={{marginRight: 8}}/>
                <Text style={styles.unsignBtnText}>Unsign Record</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : fetchedEmrData?.data?.visitStatus === 'DRAFT' && !isEditing ? (
          <TouchableOpacity 
            style={[styles.editRecordBtn, updateStatusMutation.isPending && styles.disabledBtn]} 
            onPress={handleEditRecord}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'center' }}>
                <Edit3 size={20} color="white" style={{marginRight: 8}}/>
                <Text style={styles.editRecordBtnText}>Edit Record</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.footerButtons}>
            <TouchableOpacity 
              style={[styles.draftBtn, (isPending || updateStatusMutation.isPending) && styles.disabledBtn]} 
              onPress={() => handleSubmit('DRAFT')}
              disabled={isPending || updateStatusMutation.isPending}
            >
              {(isPending || updateStatusMutation.isPending) ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Save size={20} color={colors.primary} style={{marginRight: 8}}/>
                  <Text style={styles.draftBtnText}>Draft</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitBtn, (isPending || updateStatusMutation.isPending) && styles.disabledBtn]} 
              onPress={() => handleSubmit('CHECKIN')}
              disabled={isPending || updateStatusMutation.isPending}
            >
              {(isPending || updateStatusMutation.isPending) ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle size={20} color="white" style={{marginRight: 8}}/>
                  <Text style={styles.submitBtnText}>Sign</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  headerContainer: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, ...shadows.md },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  backButton: { padding: 8, marginRight: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTitle: { ...typography.h5, color: colors.white, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  voiceSection: { alignItems: 'center', marginTop: 20, marginBottom: 10, paddingHorizontal: 20 },
  micRing: { padding: 6, borderRadius: 100, backgroundColor: 'rgba(99, 102, 241, 0.1)', marginBottom: 8 },
  micRingActive: { backgroundColor: 'rgba(99, 102, 241, 0.2)' },
  micButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  micButtonRecording: { backgroundColor: colors.primaryDark },
  recordingStatusText: { fontSize: 13, color: colors.gray600, fontWeight: '600' },
  retryButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.gray500, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  
  transcriptBubble: { marginTop: 12, backgroundColor: colors.white, padding: 12, borderRadius: 12, width: '100%', ...shadows.sm },
  transcriptText: { color: colors.gray800, fontSize: 12, fontStyle: 'italic' },
  
  processingContainer: { marginTop: 12, alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#E0E7FF', width: '100%' },
  processingText: { fontSize: 16, fontWeight: '700', color: colors.primaryDark, marginBottom: 4 },
  processingSubText: { fontSize: 12, color: colors.primary },
  
  tabsContainer: { marginBottom: 10 },
  tabsContent: { paddingHorizontal: 20, paddingVertical: 10 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, marginRight: 8, borderWidth: 1, borderColor: colors.gray200 },
  tabPillActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.sm },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  tabTextActive: { color: colors.white },

  formContainer: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gray800 },
  modernInput: { backgroundColor: colors.white, borderRadius: 16, padding: 16, minHeight: 100, textAlignVertical: 'top', fontSize: 16, color: colors.gray800, borderWidth: 1, borderColor: colors.gray100, ...shadows.sm },

  // --- ADD/EDIT MODAL STYLES ---
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: '#E0E7FF', 
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  
  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  
  modalSheet: {
    maxHeight: '90%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
  },
  modalContent: { width: '90%', backgroundColor: colors.white, borderRadius: 16, padding: 0, overflow: 'hidden' },

  formModalContent: {
    width: '100%',
    backgroundColor: colors.white,
    padding: 20,
  },
  formModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  formModalTitle: { fontSize: 18, fontWeight: '700', color: colors.gray800 },
  
  formFieldWrapper: { 
    marginBottom: 10,
   },

  formLabel: { fontSize: 12, fontWeight: '600', color: colors.gray600, marginBottom: 4, },
  
  formInput: { backgroundColor: colors.gray50, borderRadius: 8, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: 14, color: colors.gray800, borderWidth: 1, borderColor: colors.gray200, minHeight: 40, textAlignVertical: 'center', },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  
  formButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 5, },
  formButton: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, },
  cancelButton: { backgroundColor: colors.gray300, },
  cancelButtonText: { color: colors.gray800, fontWeight: '600', },
  saveButton: { backgroundColor: colors.primary, },
  saveButtonText: { color: colors.white, fontWeight: '600', },
  
  dropdownContainer: { 
    width: '100%',
    position: 'relative',
  }, 
  dropdownButton: { 
      backgroundColor: colors.gray50, borderRadius: 8, paddingHorizontal: 12, 
      paddingVertical: 10, borderWidth: 1, borderColor: colors.gray200,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dropdownText: { fontSize: 14, color: colors.gray800, flex: 1 },
  dropdownOptions: { 
      position: 'absolute', 
      top: 55, 
      left: 0, 
      right: 0, 
      backgroundColor: colors.white, 
      borderRadius: 8, 
      borderWidth: 1, 
      borderColor: colors.gray300,
      ...shadows.md,
      maxHeight: 200,
      overflow: 'hidden',
  },
  dropdownScrollView: {
    maxHeight: 180,
  },
  dropdownOption: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.gray100,
    backgroundColor: colors.white,
  },
  dropdownOptionText: { 
    fontSize: 14, 
    color: colors.gray800 
  },

  // --- END ADD/EDIT MODAL STYLES ---


  listContainer: { marginTop: 10 },
  listTitle: { fontSize: 13, fontWeight: '700', color: colors.gray500, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  emptyListText: { fontSize: 14, color: colors.gray500, fontStyle: 'italic', paddingVertical: 10, textAlign: 'center' },
  
  listItemCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F8FAFC', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  itemIconContainer: { backgroundColor: '#E0E7FF', padding: 8, borderRadius: 8, marginRight: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.gray800 },
  cardDivider: { height: 1, backgroundColor: colors.gray200 },
  cardDetails: { padding: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rowIcon: { marginRight: 8 },
  cardLabel: { fontSize: 14, color: colors.gray500, fontWeight: '500' },
  cardValue: { fontSize: 14, color: colors.gray800, fontWeight: '600', flex: 1 },

  vitalInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  vitalValueInput: { fontSize: 20, fontWeight: '700', color: colors.gray900, padding: 0, minWidth: 40 },
  vitalUnitLabel: { fontSize: 12, color: colors.gray500, marginLeft: 4, fontWeight: '600' },
  unitToggle: { backgroundColor: colors.gray100, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  vitalStatusLabel: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },

  // VITALS STYLES
  vitalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
    width: '48%', 
    minHeight: 85,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadows.sm,
    position: 'relative',
  },
  vitalIconContainer: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
  },
  vitalName: {
    fontSize: 11,
    color: colors.gray600,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  vitalUnit: {
    fontSize: 11,
    color: colors.gray500,
    fontWeight: '500',
  },
  vitalDeleteBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 4,
  },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  blueChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', 
    borderColor: '#BFDBFE', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, 
    borderRadius: 12, marginRight: 8, marginBottom: 8, 
  },
  blueChipText: { color: colors.primaryDark, fontWeight: '700', fontSize: 14 },
  chipSubText: { color: colors.primary, fontSize: 11 },

  infoBox: { marginTop: 12, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8 },
  infoBoxText: { color: colors.gray600, fontSize: 12 },
  
  footer: { backgroundColor: colors.white, paddingTop: 16, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.gray100, ...shadows.lg },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  submitBtn: { 
    flex: 1.5, 
    backgroundColor: colors.primary, 
    borderRadius: 16, 
    paddingVertical: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    ...shadows.md
  },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  draftBtn: { 
    flex: 1, 
    backgroundColor: colors.white, 
    borderRadius: 16, 
    paddingVertical: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: colors.primary,
    ...shadows.sm
  },
  unsignBtn: { 
    flex: 1, 
    backgroundColor: '#FEF3C7', 
    borderRadius: 12, 
    paddingVertical: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...shadows.sm
  },
  unsignBtnText: { color: '#B45309', fontSize: 15, fontWeight: '600' },
  editRecordBtn: { 
    flex: 1, 
    backgroundColor: colors.primary, 
    borderRadius: 16, 
    paddingVertical: 14,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    ...shadows.md
  },
  editRecordBtnText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  disabledBtn: { opacity: 0.6, backgroundColor: colors.gray400, borderColor: colors.gray400 },
  readOnlyInput: { backgroundColor: colors.gray50, color: colors.gray600 },
})

export default EMRGenerationScreen;