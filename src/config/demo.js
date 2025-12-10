// Demo configuration for testing different login scenarios
// Replace with actual API calls in production

export const DEMO_RESPONSES = {
  // Case A: Single Tenant + Single Facility
  SINGLE_TENANT_SINGLE_FACILITY: {
    message: "Login successful",
    statusCode: 200,
    data: {
      userId: "69365fb54bfc9499c2dac05d",
      fullName: "Dr. John Smith",
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      tenants: [
        {
          tenantId: "691d6b1c408d929e87c4fd3e",
          name: "City Medical Center",
          employeeId: "DOC-001",
          roles: [{ id: "role1", roleName: "DOCTOR" }],
          facilities: [{ facilityId: 6, name: "Main Campus" }]
        }
      ],
      facilities: [{ facilityId: 6, name: "Main Campus" }]
    }
  },

  // Case B: Single Tenant + Multiple Facilities
  SINGLE_TENANT_MULTIPLE_FACILITIES: {
    message: "Multiple facilities found. Please select facility.",
    statusCode: 200,
    data: {
      userId: "69365fb54bfc9499c2dac05d",
      tenantId: "691d6b1c408d929e87c4fd3e",
      fullName: "Dr. Sarah Johnson",
      facilitySelectionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      facilities: [
        { facilityId: 6, name: "Main Campus" },
        { facilityId: 10, name: "North Branch" },
        { facilityId: 15, name: "Emergency Center" }
      ]
    }
  },

  // Case C: Multiple Tenants
  MULTIPLE_TENANTS: {
    message: "Multiple tenants found. Please select tenant.",
    statusCode: 200,
    data: {
      userId: "69365fb54bfc9499c2dac05d",
      fullName: "Dr. Michael Brown",
      tenantSelectionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      tenants: [
        {
          tenantId: "tenant1",
          name: "City Medical Center",
          description: "Leading healthcare provider",
          address: "123 Health St, Medical City"
        },
        {
          tenantId: "tenant2", 
          name: "Wellness Hospital",
          description: "Comprehensive medical services",
          address: "456 Care Ave, Health Town"
        },
        {
          tenantId: "tenant3",
          name: "Prime Health Clinic", 
          description: "Specialized treatments",
          address: "789 Main Rd, Cure Valley"
        }
      ]
    }
  },

  // Error: Non-doctor role
  NON_DOCTOR_ROLE: {
    message: "Login successful",
    statusCode: 200,
    data: {
      userId: "user123",
      fullName: "John Admin",
      tenants: [
        {
          tenantId: "tenant1",
          name: "Hospital",
          roles: [{ roleName: "ADMIN" }] // Not DOCTOR
        }
      ]
    }
  }
};

// Demo credentials for testing
export const DEMO_CREDENTIALS = {
  // Case A
  SINGLE_FACILITY: {
    email: "doctor.single@demo.com",
    password: "demo123"
  },
  
  // Case B  
  MULTIPLE_FACILITIES: {
    email: "doctor.multi@demo.com", 
    password: "demo123"
  },
  
  // Case C
  MULTIPLE_TENANTS: {
    email: "doctor.tenants@demo.com",
    password: "demo123"
  },
  
  // Error case
  NON_DOCTOR: {
    email: "admin@demo.com",
    password: "demo123"
  }
};