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
  Modal, 
  Pressable,
  useWindowDimensions 
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

import { useAiTranscriptionMutation, useSaveEmrDataMutation } from '../../hooks/useEmr';
import { 
  Mic, MicOff, ChevronLeft, Trash2, Activity, Edit3, CheckCircle, Clock, FileText, 
  Shield, Info, Loader, Hash, Calendar, Zap, List, Plus, X,
  ChevronDown
} from 'lucide-react-native';
import { useSelector } from 'react-redux';

const DURATION_TYPES = ['days', 'weeks', 'months', 'years'];
const SEVERITY_TYPES = ['Mild', 'Moderate', 'Severe'];





// --- GLOBAL CONSTANTS ---
const audioPath = `${RNFS.DocumentDirectoryPath}/consultation_audio.aac`;

const EMRGenerationScreen = () => {
  const route = useRoute();
  const patientData = route?.params?.patientData ||'';
  const { user } = useSelector((state) => state.auth);

  const {mutateAsync,isPending,data} = useSaveEmrDataMutation()
  
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [audioData, setAudioData] = useState({ data: '', isRecording: false });
  const aiTranscriptionMutation = useAiTranscriptionMutation();
  // --- Animation State ---
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // --- Core States ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [transcript, setTranscript] = useState('');
  const apiIsLoading =aiTranscriptionMutation.isPending
  const tabs = [
    'diagnosis', 'chiefComplaint', 'service', 'pharmacy', 'patientHistory', 
    'familyHistory', 'surgicalHistory', 'allergies', 'instructions', 'summary'
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

  // Structured fields - used for Diagnosis, Chief Complaint, etc.
  const [structuredData, setStructuredData] = useState({
    pharmacy: [],
    allergies:  [],
    chiefComplaint:  [],
    diagnosis:  [],
    service:  [],
  });

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
      Alert.alert("Permission Denied", "Microphone access is required for recording.");
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
      Alert.alert("Recording Error", `Failed to start recording: ${error.message}`);
      setIsRecording(false);
    }
  }, [checkPermissions]);
  const stopRecording = async () => {
    try {
      const filePath = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      
      // START PROCESSING
      setIsProcessing(true); 
      setAudioData(prev => ({ ...prev, isRecording: false }));
      setTranscript('Audio recorded. Analyzing consultation...'); // Give immediate feedback
      
      const base64Audio = await RNFS.readFile(filePath, 'base64');
      const fileExists = await RNFS.exists(filePath);
      if (fileExists) await RNFS.unlink(filePath);
  
      try {
        const aiResult = await aiTranscriptionMutation.mutateAsync(base64Audio);
        
        if (aiResult) {
          setTranscript(aiResult.transcription || '');
          setStructuredData({
            pharmacy: aiResult?.pharmacy || [],
            allergies: aiResult.allergies || [],
            chiefComplaint: aiResult.chiefComplaint || [],
            diagnosis: aiResult.diagnosis || [],
            service: aiResult.service || [],
        });
          // setStructuredData({
          //   pharmacy: aiResult.pharmacy || [], allergies: aiResult.allergies || [], 
          //   chiefComplaint: aiResult.chiefComplaint || [], diagnosis: aiResult.diagnosis || [], 
          //   service: aiResult.service || [], instructions: aiResult.instructions || []
          // });

          setFormText({
            patientHistory: aiResult?.patientHistory ,
            familyHistory: aiResult?.familyHistory,
            surgicalHistory: aiResult?.surgicalHistory,
            instructions: aiResult?.instructions?.map(i => i.generalInstructions).join('\n') || '',
            summary: aiResult?.summary,
        });

          // setFormText({
          //   diagnosis: aiResult.diagnosis?.map(d => `${d.diagnosisName} (${d.icdCode || ''})`).join(', ') || '',
          //   chiefComplaint: aiResult.chiefComplaint?.map(c => c.complaintName).join(', ') || '',
          //   service: aiResult.service?.map(s => s.testOrServiceName).join(', ') || '',
          //   pharmacy: aiResult.pharmacy?.map(p => p.medicineName).join(', ') || '',
          //   patientHistory: aiResult.patientHistory || '',
          //   familyHistory: aiResult.familyHistory || '',
          //   surgicalHistory: aiResult.surgicalHistory || '',
          //   allergies: aiResult.allergies?.map(a => a.allergiesName).join(', ') || '',
          //   instructions: aiResult.instructions?.map(i => i.generalInstructions).join('\n') || '',
          //   summary: aiResult.summary || '',
          // });
        }
      } catch (aiError) {
        console.error(aiError);
        setTranscript('AI processing failed. Please check the recording.');
      } finally {
        // END PROCESSING
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Recording error:', error);
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
        Alert.alert("Transcription Complete", "EMR fields populated from transcription.");

        // Clean up audio file (Mocked)
        // await RNFS.unlink(audioPath); 
      }, 3000);

    } catch (error) {
      Alert.alert("Recording Error", `Failed to stop recording: ${error.message}`);
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
            setAudioData({ ...audioData, isRecording: true });
            await Sound.startRecorder();
        }
    }
  };

  // --- EMR LOGIC ---

  const getTabLabel = (key) => {
    switch(key) {
      case 'patientHistory': return 'Patient Hx';
      case 'familyHistory': return 'Family Hx';
      case 'surgicalHistory': return 'Surgical Hx';
      case 'chiefComplaint': return 'Symptoms';
      case 'pharmacy': return 'Medications';
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

  const handleSubmit = () => {
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
        // Ensure unit/type is one of the allowed values or defaults if empty
        // In a real app, you might want to validate this before submission or enforce via UI
        dosageUnit: p.dosageUnit || 'tablet', // Default fallback if empty
        durationType: p.durationType || 'days',
    }));

    const processedChiefComplaint = structuredData.chiefComplaint.map(c => ({
        ...c,
        duration: parseNumber(c.duration),
        // user might leave severity empty, ensure it's a string if needed
        severity: c.severity || 'Mild',
        durationType: c.durationType+'s' || 'days', 
    }));

    const finalJSON = {
        ...structuredData,
        // Replace with processed arrays
        pharmacy: processedPharmacy,
        chiefComplaint: processedChiefComplaint,
        
        // Ensure other fields are strings
        patientHistory: formText.patientHistory || "",
        familyHistory: formText.familyHistory || "",
        surgicalHistory: formText.surgicalHistory || "",
        summary: formText.summary || "",
        
        // Instructions are simplified back into an array for the JSON output
        instructions: [{ generalInstructions: formText.instructions || "" }] 
    };

    mutateAsync({
      'registrationId':patientData?.registrationId,
      visitId:patientData?.visitId,
      facilityId:user?.facility?.facilityId,
      emrData : {...finalJSON}
    })

    console.log("FINAL JSON SUBMISSION:", JSON.stringify(finalJSON, null, 2));
    Alert.alert('Success', 'EMR Saved successfully.');
  };

  // --- REUSABLE COMPONENTS ---

  const CardContainer = ({ children, headerIcon, headerText, onDelete, onEdit }) => (
    <TouchableOpacity onPress={onEdit} disabled={!onEdit}>
        <View style={styles.listItemCard}>
            <View style={styles.cardHeader}>
                <View style={styles.itemIconContainer}>
                    {headerIcon}
                </View>
                <Text style={styles.cardTitle}>{headerText}</Text>
                {/* Delete button is always present, but requires an onDelete handler */}
                {onDelete && (
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
                return { allergiesName: '', icdCode: '', ...base };
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
        Alert.alert("Missing Field", `Please enter all required fields for ${getTabLabel(category)}.`);
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
    if (!['diagnosis', 'chiefComplaint', 'service', 'pharmacy', 'allergies'].includes(category)) return null;

    return (
        <>
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setModalState({ category, mode: 'add', index: undefined, data: {} })}
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
                 <Text style={styles.blueChipText}>{item.allergiesName}</Text>
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
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
     
      {/* new header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>EMR</Text>
            <Text style={styles.headerSubtitle}>{patientData?.patientName || 'Patient EMR'}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.mainScroll} 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Voice Recorder Section */}
          <View style={styles.voiceSection}>
            <View style={[styles.micRing, (audioData?.isRecording || isProcessing) && styles.micRingActive]}>
              <TouchableOpacity 
                style={[styles.micButton, (audioData?.isRecording || isProcessing) && styles.micButtonRecording]}
                onPress={handleRecordAudio}
                disabled={isProcessing || apiIsLoading} 
              >
                {(isProcessing || apiIsLoading) ? (
                  <Animated.View style={animatedStyle}><Loader size={32} color="white" /></Animated.View>
                ) : audioData?.isRecording ? (
                  <MicOff size={32} color="white" />
                ) : (
                  <Mic size={32} color="white" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.recordingStatusText}>
              {(isProcessing || apiIsLoading) ? "Processing..." : audioData?.isRecording ? "Tap to Stop" : "Tap to Record"}
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

               {/* Main Text Input for History/Summary/Manual Edit */}
               {(!['diagnosis', 'chiefComplaint', 'service', 'pharmacy', 'allergies'].includes(activeTab) || ['instructions', 'summary'].includes(activeTab)) && (
                   <TextInput
                      style={styles.modernInput}
                      placeholder={`Enter ${getTabLabel(activeTab)} details...`}
                      placeholderTextColor={colors.gray400}
                      multiline
                      value={formText[activeTab]}
                      onChangeText={(text) => setFormText(prev => ({...prev, [activeTab]: text}))}
                    />
               )}

                {/* Structured List Views */}
                {activeTab === 'diagnosis' && renderStructuredView('diagnosis', renderDiagnosisList)}
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
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <CheckCircle size={20} color="white" style={{marginRight: 8}}/>
          <Text style={styles.submitBtnText}>Generate Final EMR</Text>
        </TouchableOpacity>
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
  submitBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
})

export default EMRGenerationScreen;