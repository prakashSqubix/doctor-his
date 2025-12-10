import { Dimensions, PixelRatio, NativeModules } from 'react-native';

// https://medium.com/nerd-for-tech/react-native-styles-normalization-e8ce77a3110c

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

// get device width and height
const deviceWidth = Dimensions.get('screen').width;
const deviceheight = Dimensions.get('screen').height;

// get Status Bar height
const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = StatusBarManager?.HEIGHT;

const screenWidth = width;
const screenHeight = height;

// Guideline sizes are based on standard iPhone 14 screen mobile device
// const guidelineBaseWidth = 430;
// const guidelineBaseHeight = 930;

const widthBaseScale = width / 430;
const heightBaseScale = height / 930;

function normalize(size, based = 'width') {
  const newSize = based === 'height' ? size * heightBaseScale : size * widthBaseScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// for width  pixel
const widthPixel = (size) => normalize(size, 'width');

// for height  pixel
const heightPixel = (size) => normalize(size, 'height');
// for font  pixel
const fontPixel = (size) => heightPixel(size);
// for Margin and Padding vertical pixel
const pixelSizeVertical = (size) => heightPixel(size);
// for Margin and Padding horizontal pixel
const pixelSizeHorizontal = (size) => widthPixel(size);

export const BOOK_APPOINTMENT = 'In-Person Appointment';
export const VIDEO_CONSULTATION = 'Video Consultation';
export const myRecordTab = {
  opVisit: 0,
  ipVisit: 1,
};

export const storageKeys = {
  authToken: 'AUTH_TOKEN',
  azureSsoToken: 'AZURE_SSO_TOKEN',
  userId: 'USER_ID',
  deviceStatusInterval: 'DEVICE_STATUS_INTERVAL',
  facilityData: 'FACILITY_DATA',
};

export const FACE_LOCK_API_KEY = '282873857264-qe4e90e4gb3cb64fqa3t7kmpuuo5123';

export function parseUrl(url) {
  const segments = url.split('/').filter((segment) => segment);
  const initialRoute = segments[1];

  function buildRouteConfig(parts) {
    if (parts.length === 0) return null;
    const screen = parts.shift();
    const params = buildRouteConfig(parts);
    return params ? { screen, params } : { screen };
  }

  const routeConfig = buildRouteConfig(segments.slice(2));
  return { initialRoute, routeConfig };
}

const Months = [
  {
    value: 1,
    label: 'January',
    itemAccessibilityLabelField: 'January',
  },
  {
    value: 2,
    label: 'February',
    itemAccessibilityLabelField: 'February',
  },
  {
    value: 3,
    label: 'March',
    itemAccessibilityLabelField: 'March',
  },
  {
    value: 4,
    label: 'April',
    itemAccessibilityLabelField: 'April',
  },
  {
    value: 5,
    label: 'May',
    itemAccessibilityLabelField: 'May',
  },
  {
    value: 6,
    label: 'June',
    itemAccessibilityLabelField: 'June',
  },
  {
    value: 7,
    label: 'July',
    itemAccessibilityLabelField: 'July',
  },
  {
    value: 8,
    label: 'August',
    itemAccessibilityLabelField: 'August',
  },
  {
    value: 9,
    label: 'September',
    itemAccessibilityLabelField: 'September',
  },
  {
    value: 10,
    label: 'October',
    itemAccessibilityLabelField: 'October',
  },
  {
    value: 11,
    label: 'November',
    itemAccessibilityLabelField: 'November',
  },
  {
    value: 12,
    label: 'December',
    itemAccessibilityLabelField: 'December',
  },
];


export {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
  screenWidth,
  screenHeight,
  STATUSBAR_HEIGHT,
  deviceWidth,
  deviceheight,
  Months,
};
