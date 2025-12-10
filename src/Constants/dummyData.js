// Dummy Tenants (Clinics/Hospitals)
export const DUMMY_TENANTS = [
    {
      _id: 'tenant_1',
      name: 'City Medical Center',
      description: 'Leading healthcare provider',
      address: '123 Health St, Medical City, MC 12345',
    },
    {
      _id: 'tenant_2',
      name: 'Wellness Hospital',
      description: 'Comprehensive medical services',
      address: '456 Care Ave, Health Town, HT 67890',
    },
    {
      _id: 'tenant_3',
      name: 'Prime Health Clinic',
      description: 'Specialized treatments',
      address: '789 Main Rd, Cure Valley, CV 11111',
    },
  ];
  
  // Dummy Patients
  export const DUMMY_PATIENTS = [
    {
      _id: 'patient_1',
      tenantId: 'tenant_1',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1985-03-15',
      gender: 'male',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '100 Oak Ave, Medical City, MC 12345',
      medicalHistory: 'Hypertension, Type 2 Diabetes',
    },
    {
      _id: 'patient_2',
      tenantId: 'tenant_1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1990-07-22',
      gender: 'female',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 234-5678',
      address: '200 Maple St, Medical City, MC 12345',
      medicalHistory: 'Asthma, Allergies',
    },
    {
      _id: 'patient_3',
      tenantId: 'tenant_1',
      firstName: 'Michael',
      lastName: 'Williams',
      dateOfBirth: '1978-11-30',
      gender: 'male',
      email: 'michael.williams@email.com',
      phone: '+1 (555) 345-6789',
      address: '300 Pine Ln, Medical City, MC 12345',
      medicalHistory: 'Arthritis, Previous heart condition',
    },
    {
      _id: 'patient_4',
      tenantId: 'tenant_1',
      firstName: 'Emma',
      lastName: 'Brown',
      dateOfBirth: '1988-05-12',
      gender: 'female',
      email: 'emma.brown@email.com',
      phone: '+1 (555) 456-7890',
      address: '400 Elm Dr, Medical City, MC 12345',
      medicalHistory: 'Migraines, Thyroid issues',
    },
    {
      _id: 'patient_5',
      tenantId: 'tenant_1',
      firstName: 'David',
      lastName: 'Garcia',
      dateOfBirth: '1992-09-08',
      gender: 'male',
      email: 'david.garcia@email.com',
      phone: '+1 (555) 567-8901',
      address: '500 Birch Blvd, Medical City, MC 12345',
      medicalHistory: 'Seasonal allergies',
    },
    {
      _id: 'patient_6',
      tenantId: 'tenant_1',
      firstName: 'Lisa',
      lastName: 'Martinez',
      dateOfBirth: '1987-02-20',
      gender: 'female',
      email: 'lisa.martinez@email.com',
      phone: '+1 (555) 678-9012',
      address: '600 Cedar Ct, Medical City, MC 12345',
      medicalHistory: 'Anxiety, Sleep disorders',
    },
    {
      _id: 'patient_7',
      tenantId: 'tenant_2',
      firstName: 'James',
      lastName: 'Wilson',
      dateOfBirth: '1980-01-14',
      gender: 'male',
      email: 'james.wilson@email.com',
      phone: '+1 (555) 789-0123',
      address: '700 Oak St, Health Town, HT 67890',
      medicalHistory: 'None',
    },
    {
      _id: 'patient_8',
      tenantId: 'tenant_2',
      firstName: 'Amanda',
      lastName: 'Davis',
      dateOfBirth: '1995-06-25',
      gender: 'female',
      email: 'amanda.davis@email.com',
      phone: '+1 (555) 890-1234',
      address: '800 Pine Ave, Health Town, HT 67890',
      medicalHistory: 'Healthy',
    },
  ];
  
  // Dummy EMR Records
  export const DUMMY_EMR_RECORDS = [
    {
      _id: 'emr_1',
      patientId: 'patient_1',
      doctorId: 'doc_1',
      tenantId: 'tenant_1',
      visitDate: '2024-01-15',
      diagnosis: 'Hypertension Stage 2',
      symptoms: 'Headaches, dizziness, fatigue',
      treatment: 'Increased dosage of amlodipine, lifestyle modifications',
      prescriptions: 'Amlodipine 10mg daily, Metformin 1000mg twice daily',
      notes: 'Patient compliant with medication. Blood pressure slightly elevated.',
      _creationTime: 1705276800000,
    },
    {
      _id: 'emr_2',
      patientId: 'patient_1',
      doctorId: 'doc_1',
      tenantId: 'tenant_1',
      visitDate: '2024-01-08',
      diagnosis: 'Type 2 Diabetes - Follow-up',
      symptoms: 'Occasional thirst, normal energy levels',
      treatment: 'Continue current medication, monitor blood glucose',
      prescriptions: 'Metformin 1000mg twice daily',
      notes: 'HbA1c within target range. Continue current regimen.',
      _creationTime: 1704672000000,
    },
    {
      _id: 'emr_3',
      patientId: 'patient_2',
      doctorId: 'doc_1',
      tenantId: 'tenant_1',
      visitDate: '2024-01-20',
      diagnosis: 'Seasonal Allergic Rhinitis',
      symptoms: 'Sneezing, nasal congestion, itchy eyes',
      treatment: 'Antihistamine therapy, nasal corticosteroid spray',
      prescriptions: 'Cetirizine 10mg daily, Fluticasone nasal spray',
      notes: 'Symptoms well-controlled with medication.',
      _creationTime: 1705881600000,
    },
    {
      _id: 'emr_4',
      patientId: 'patient_3',
      doctorId: 'doc_1',
      tenantId: 'tenant_1',
      visitDate: '2024-01-18',
      diagnosis: 'Osteoarthritis - Knee',
      symptoms: 'Knee pain with movement, stiffness in morning',
      treatment: 'Physical therapy, anti-inflammatory medication, weight management',
      prescriptions: 'Ibuprofen 400mg as needed, Glucosamine supplement',
      notes: 'Refer to physical therapy. Cardiac status stable.',
      _creationTime: 1705708800000,
    },
    {
      _id: 'emr_5',
      patientId: 'patient_4',
      doctorId: 'doc_1',
      tenantId: 'tenant_1',
      visitDate: '2024-01-17',
      diagnosis: 'Tension Migraine with Aura',
      symptoms: 'Severe headache, visual disturbances, sensitivity to light',
      treatment: 'Acute pain management, preventive therapy',
      prescriptions: 'Sumatriptan 50mg as needed, Propranolol 40mg daily',
      notes: 'Patient kept migraine diary. Consider preventive medication optimization.',
      _creationTime: 1705622400000,
    },
    {
      _id: 'emr_6',
      patientId: 'patient_5',
      doctorId: 'doc_1',
      tenantId: 'tenant_1',
      visitDate: '2024-01-19',
      diagnosis: 'Annual Health Checkup',
      symptoms: 'None reported',
      treatment: 'Routine examination, preventive care discussion',
      prescriptions: 'None',
      notes: 'Patient in good health. All vital signs normal.',
      _creationTime: 1705795200000,
    },
    {
      _id: 'emr_7',
      patientId: 'patient_6',
      doctorId: 'doc_1',
      tenantId: 'tenant_1',
      visitDate: '2024-01-16',
      diagnosis: 'Generalized Anxiety Disorder',
      symptoms: 'Difficulty concentrating, insomnia, nervousness',
      treatment: 'Cognitive behavioral therapy, medication management',
      prescriptions: 'Sertraline 100mg daily, Melatonin supplement',
      notes: 'Referral to psychologist. Advised on stress management.',
      _creationTime: 1705536000000,
    },
    {
      _id: 'emr_8',
      patientId: 'patient_7',
      doctorId: 'doc_2',
      tenantId: 'tenant_2',
      visitDate: '2024-01-21',
      diagnosis: 'Routine Physical Examination',
      symptoms: 'No symptoms',
      treatment: 'Standard preventive care',
      prescriptions: 'None',
      notes: 'All vitals normal. Excellent health.',
      _creationTime: 1705968000000,
    },
  ];


  // Dummy Appointments
export const DUMMY_APPOINTMENTS = [
  {
    _id: 'apt_1',
    patientId: 'patient_1',
    tenantId: 'tenant_1',
    date: '2025-12-05',
    time: '09:00 AM',
    reason: 'Blood Pressure Checkup',
    status: 'Scheduled',
  },
  {
    _id: 'apt_2',
    patientId: 'patient_2',
    tenantId: 'tenant_1',
    date: '2025-12-05',
    time: '11:30 AM',
    reason: 'Diabetes Follow-up',
    status: 'Scheduled',
  },
  {
    _id: 'apt_3',
    patientId: 'patient_3',
    tenantId: 'tenant_1',
    date: '2025-12-06',
    time: '02:00 PM',
    reason: 'Knee Pain Consultation',
    status: 'Scheduled',
  },
  {
    _id: 'apt_4',
    patientId: 'patient_7',
    tenantId: 'tenant_2',
    date: '2025-12-05',
    time: '10:00 AM',
    reason: 'General Checkup',
    status: 'Scheduled',
  },
];

// Helper → Today's Appointments
export function getTodaysAppointments(tenantId) {
  const today = new Date().toISOString().split('T')[0];

  const patients = DUMMY_PATIENTS;

  return DUMMY_APPOINTMENTS
    .filter(a => a.tenantId === tenantId && a.date === today)
    .map(a => {
      const patient = patients.find(p => p._id === a.patientId);
      return {
        ...a,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      };
    });
}

  
  // Helper: Get patients by tenant
  export function getPatientsByTenant(tenantId) {
    return DUMMY_PATIENTS.filter(p => p.tenantId === tenantId);
  }
  
  // Helper: Get EMR records by patient
  export function getEMRRecordsByPatient(patientId) {
    return DUMMY_EMR_RECORDS
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  }
  
  // Helper: Recent EMR by tenant
  export function getRecentEMRRecordsByTenant(tenantId, limit = 5) {
    return DUMMY_EMR_RECORDS
      .filter(r => r.tenantId === tenantId)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
      .slice(0, limit);
  }
  
  // Dashboard Stats
  export function getDashboardStats(tenantId) {
    const patients = getPatientsByTenant(tenantId);
    const records = DUMMY_EMR_RECORDS.filter(r => r.tenantId === tenantId);
    const recent = getRecentEMRRecordsByTenant(tenantId, 5);
    const appointments = getTodaysAppointments(tenantId);
  
    return {
      totalPatients: patients.length,
      totalRecords: records.length,
      recentRecords: recent.map(r => {
        const patient = DUMMY_PATIENTS?.find(p => p._id === r.patientId);
        return {
          _id: r._id,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
          visitDate: r.visitDate,
          diagnosis: r.diagnosis,
        };
      }),
      appointments,
    };
  }


  
  // Add EMR Record
  let nextEMRId = DUMMY_EMR_RECORDS.length + 1;
  
  export function addEMRRecord(patientId, doctorId, tenantId, data) {
    const newRecord = {
      _id: `emr_${nextEMRId++}`,
      patientId,
      doctorId,
      tenantId,
      ...data,
      _creationTime: Date.now(),
    };
  
    DUMMY_EMR_RECORDS.push(newRecord);
    return newRecord;
  }
  