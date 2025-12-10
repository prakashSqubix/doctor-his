import { Platform } from 'react-native';

const fontFamily = {
//   WorkSans: 'WorkSans-VariableFont_wght',
  WorkSans: Platform.OS === 'android' ? 'WorkSans-VariableFont_wght' : 'WorkSansRoman-Wght',
  OpenSans: Platform.OS === 'android' ? 'OpenSans-VariableFont_wdth,wght' : 'OpenSans-VariableFont_wdth,wght',
  WorkSansMedium: Platform.OS === 'android' ? 'work-sans.medium' : 'WorkSans-Medium',
  WorkSansSemiBold: Platform.OS === 'android' ? 'work-sans.semibold' : 'WorkSans-SemiBold',
  WorkSansBold: Platform.OS === 'android' ? 'work-sans.bold' : 'WorkSans-Bold',
  PoppinsBold: Platform.OS === 'android' ? 'poppins.bold' : 'Poppins-Bold',
  PoppinsMedium: Platform.OS === 'android' ? 'poppins.medium' : 'Poppins-Medium',
  PoppinsSemiBold: Platform.OS === 'android' ? 'poppins.semibold' : 'Poppins-SemiBold',
  PoppinsThinItalic: Platform.OS === 'android' ? 'poppins.thin-italic' : 'Poppins-ThinItalic',

};

export default fontFamily;
