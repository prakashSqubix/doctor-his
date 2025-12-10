import Config from 'react-native-config';
import {
  cardiology,
  coldFever,
  dermatology,
  headAche,
  lungs,
  neurology,
  nursingCare,
  physiotherapy,
  scanAtHome,
  stomachAche,
} from '../../assets/images/Images';

export const mockUserData = [
  {
    username: 'john_doe',
    userId: '1',
    userProfileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    username: 'jane_smith',
    userId: '2',
    userProfileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    username: 'michael_jordan',
    userId: '3',
    userProfileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    username: 'linda_williams',
    userId: '4',
    userProfileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    username: 'john_doe',
    userId: '5',
    userProfileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    username: 'jane_smith',
    userId: '6',
    userProfileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    username: 'michael_jordan',
    userId: '7',
    userProfileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    username: 'linda_williams',
    userId: '8',
    userProfileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
];

export const categoriesData = [
  {
    username: 'Neurology',
    userId: '1',
    // userProfileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    userProfileImage: neurology,
  },
  {
    username: 'Cardiology',
    userId: '2',
    // userProfileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    userProfileImage: cardiology,
  },
  {
    username: 'Lungs',
    userId: '3',
    // userProfileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    userProfileImage: lungs,
  },
  {
    username: 'Lungs',
    userId: '4',
    userProfileImage: lungs,
  },
  {
    username: 'Cardiology',
    userId: '5',
    userProfileImage: cardiology,
  },
  {
    username: 'Neurology',
    userId: '6',
    userProfileImage: neurology,
  },
];

export const bannerData = [
  { id: 1, imageUrl: 'https://media.gettyimages.com/id/1457213598/vector/the-concept-of-medicine-and-emergency-medical-care-in-a-realistic-style-a-stethoscope-with-a.jpg?s=612x612&w=gi&k=20&c=ZoxMLWKWvzRIKtoPdSOqvGvu0FktVxZIIfN8WS1yFPE=' },
  { id: 2, imageUrl: 'https://thumbs.dreamstime.com/b/photo-heart-two-stethoscopes-orange-background-symbolizing-health-care-all-web-banner-copyspace-right-336052782.jpg' },
  { id: 3, imageUrl: 'https://media.licdn.com/dms/image/D4D12AQG8cJGZAGhM4w/article-cover_image-shrink_720_1280/0/1716454728603?e=2147483647&v=beta&t=n3ZdZgCxiHRidiQui_M-G0S7-GAyvVpEHKJfbpW9LM0' },
  { id: 4, imageUrl: 'https://media.gettyimages.com/id/1308768132/vector/modern-medical-banner-for-social-media-post-template.jpg?s=1024x1024&w=gi&k=20&c=S2GGPnoXKcGYeLhJWvQAqbbhT17OPdTs8fXaZo15hTs=' },
  { id: 5, imageUrl: 'https://akhilsystems.com/wp-content/uploads/2023/07/improving-access-to-health-data.png' },
];

export const getBannerData = () => {
  let env = Config?.ENV || '';
  env = env.toLowerCase();
  if (env?.includes('ankura')) {
    return [
      { id: 1, imageUrl: 'https://miracle.ankurahospitals.com:1020/Icons/Banner1.png' },
      { id: 2, imageUrl: 'https://miracle.ankurahospitals.com:1020/Icons/Banner2.png' },
      { id: 3, imageUrl: 'https://miracle.ankurahospitals.com:1020/Icons/Banner3.png' },
    ];
  }
  return bannerData;
};

export const doctors = [
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    image: 'https://randomuser.me/api/portraits/men/1.jpg', // Path to image asset or URL
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
  },
  {
    name: 'Dr. Neeraj Sharma',
    specialty: 'General Physician',
    experience: '15Y Exp',
    fees: '299',
    rating: '4.5',
    availableAt: '16:45 PM Today',
    image: 'https://randomuser.me/api/portraits/men/3.jpg', // Path to image asset or URL
  },
];

export const symptoms = [
  {
    id: 1,
    image: stomachAche,
    name: 'Stomach Ache',
  },
  {
    id: 2,
    image: headAche,
    name: 'Head Ache',
  },
  {
    id: 3,
    image: coldFever,
    name: 'Cold Fever',
  },
  {
    id: 4,
    image: dermatology,
    name: 'Dermatology',
  },
];

export const categoriesList = [
  {
    id: '1',
    name: 'Neurology',
  },
  {
    id: '2',
    name: 'Cardiology',
  },
  {
    id: '3',
    name: 'Dermatology',
  },
  {
    id: '4',
    name: 'Pediatrics',
  },
  {
    id: '5',
    name: 'Orthopedics',
  },
  {
    id: '6',
    name: 'Ophthalmology',
  },
  {
    id: '7',
    name: 'Gastroenterology',
  },
  {
    id: '8',
    name: 'Psychiatry',
  },
  {
    id: '9',
    name: 'Pulmonology',
  },
  {
    id: '10',
    name: 'Oncology',
  },
];

export const doctorDetail = 'Dr. Anu Aggrawaal is a dedicated cardiologist committed to providing exceptional care to her patients. With a passion for cardiology and a wealth of experience, Dr. Aggarwaal specializes in diagnosing and treating various cardiovascular conditions, ranging from hypertension to heart failure. Her compassionate approach coupled with her expertise ensures that each patient receives personalized attention and comprehensive treatment plans tailored to their unique needs. Dr. Aggarwaal\'s unwavering commitment to cardiac health and her ability to communicate complex medical information in an accessible manner make her a trusted and respected member of the healthcare community.';

export const treatmentsAndProcedures = [
  'Physical Therapy',
  'Chemotherapy',
  'Radiation Therapy',
  'Immunotherapy',
  'Blood Transfusion',
  'Dialysis',
  'Vaccination',
  'Intravenous (IV) Therapy',
  'Medication Management',
  'Oxygen Therapy',
];

export const diagnosticProcedures = [
  'CT Scan',
  'MRI',
  'X-ray',
  'Ultrasound',
  'PET Scan',
  'Mammogram',
  'Echocardiogram',
  'Bone Density',
  'Fluoroscopy',
  'Angiography',
  'Colonoscopy',
];

export const doctorAwards = [
  'Fellowship from AIIMS',
  'Fellowship in Cardiology',
];

export const appointments = [
  {
    type: 'Upcoming',
    date: '10 Jan, Wed',
    time: '11:00 - 11:05 AM',
    doctor: {
      name: 'Dr. Ankit Choudhary',
      specialization: 'Cardiology',
    },
    facility: {
      name: 'Miracle Yashoda Hospital',
      location: 'Gurugram Sector 23',
      link: 'https://maps.google.com/?q=Miracle+Yashoda+Hospital,Gurugram+Sector+23',
    },
    bookingId: 'CBM129STR',
    actions: {
      cancel: {
        text: 'Cancel',
        color: 'red',
      },
      pay: {
        text: 'Pay 699',
        color: 'blue',
        amount: 699,
      },
    },
    icon: 'reload',
  },
  {
    type: 'Cancelled',
    date: '10 Jan, Wed',
    time: '11:00 - 11:05 AM',
    doctor: {
      name: 'Dr. Ankit Choudhary',
      specialization: 'Cardiology',
    },
    facility: {
      name: 'Miracle Yashoda Hospital',
      location: 'Gurugram Sector 23',
      link: 'https://maps.google.com/?q=Miracle+Yashoda+Hospital,Gurugram+Sector+23',
    },
    bookingId: 'CBM129STR',
    icon: 'info',
  },
];

export const addressList = [
  {
    id: 1,
    label: 'Home',
    address: 'G145, Vijay Vihar, Delhi, New Delhi -110040',
    phone: '+91-775467845',
    icon: 'home',
    edit_icon: 'edit',
    delete_icon: 'delete',
  },
  {
    id: 2,
    label: 'Office',
    address: 'G145, Vijay Vihar, Delhi, New Delhi -110040',
    phone: '+91-775467845',
    icon: 'office',
    edit_icon: 'edit',
    delete_icon: 'delete',
  },
  {
    id: 3,
    label: 'Home 2',
    address: 'G145, Vijay Vihar, Delhi, New Delhi -110040',
    phone: '+91-775467845',
    icon: 'home',
    edit_icon: 'edit',
    delete_icon: 'delete',
  },
];

export const pinCodeData = [
  {
    id: 1,
    pinCode: '110075',
    location: 'Dwarka Mor',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 2,
    pinCode: '110075',
    location: 'Sector 12 Dwarka',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 3,
    pinCode: '110075',
    location: 'Sector 6 Dwarka',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 4,
    pinCode: '110075',
    location: 'Sector 8 Dwarka',
    isSelected: true,
    icon: 'homeIcon',
  },
  {
    id: 5,
    pinCode: '110074',
    location: 'Sector 5 Dwarka',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 6,
    pinCode: '110074',
    location: 'Sector 4 Dwarka',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 7,
    pinCode: '110073',
    location: 'Mahavir Enclave',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 8,
    pinCode: '110073',
    location: 'Palam Village',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 9,
    pinCode: '110076',
    location: 'Janakpuri',
    isSelected: false,
    icon: 'homeIcon',
  },
  {
    id: 10,
    pinCode: '110078',
    location: 'Uttam Nagar',
    isSelected: false,
    icon: 'homeIcon',
  },
];

export const labTestData = [
  {
    id: 1,
    testName: 'Liver Function Test',
    testCount: 6,
    icon: 'testIcon',
    action: 'add',
    fees: 500,
    reportTime: 10,
  },
  {
    id: 2,
    testName: 'Complete Blood Count',
    testCount: 6,
    icon: 'testIcon',
    action: 'add',
    fees: 500,
    reportTime: 10,
  },
  {
    id: 3,
    testName: 'Lipid Profile',
    testCount: 6,
    icon: 'testIcon',
    action: 'add',
    fees: 500,
    reportTime: 10,
  },
  {
    id: 4,
    testName: 'Kidney Function Test',
    testCount: 6,
    icon: 'testIcon',
    action: 'add',
    fees: 500,
    reportTime: 10,
  },
  {
    id: 5,
    testName: 'Blood Glucose Fasting',
    testCount: 6,
    icon: 'testIcon',
    action: 'add',
    fees: 500,
    reportTime: 10,
  },
];

export const homeHealthServices = [
  {
    id: 1,
    name: 'Nursing Care',
    icon: nursingCare,
  },
  {
    id: 2,
    name: 'Physiotherapy',
    icon: physiotherapy,
  },
  {
    id: 3,
    name: 'Scan at Home',
    icon: scanAtHome,
  },
];
