import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Image,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { loginStart, clearError } from '../../store/slices/authSlice';


import { TextInput, Button } from '../../components';
import { colors, spacing, typography, radius } from '../../Constants/theme';
import { useLoginMutation } from '../../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CAROUSEL_DATA = [
  {
    id: 1,
    title: 'Secure Healthcare Data',
    description: 'Advanced encryption for patient privacy and data security.',
    image: require('../../assets/images/secure_login.png'), 
  },
  {
    id: 2,
    title: 'Easy Hospital Management',
    description: 'Streamline operations with our intuitive management tools.',
    image: require('../../assets/images/easy_management.png'),
  },
  {
    id: 3,
    title: 'Real-time Medical Analytics',
    description: 'Track patient vitals and health metrics instantly.',
    image: require('../../assets/images/analytics.png'),
  },
];

const CarouselItem = ({ item }) => {
  return (
    <View style={styles.carouselItem}>
      <Image source={item.image} style={styles.carouselImage} resizeMode="contain" />
      <View style={styles.carouselTextContainer}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <Text style={styles.carouselDesc}>{item.description}</Text>
      </View>
    </View>
  );
};

import { useToast } from '../../providers/ToastContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('rajesh.khuntia@squbix.com');
  const [password, setPassword] = useState('12345678');
  // const [email, setEmail] = useState('deepak.senapati@squbix.com');
  // const [password, setPassword] = useState('99999999');
  const [errors, setErrors] = useState({});
  
  const { error: authError } = useSelector((state) => state.auth);
  const loginMutation = useLoginMutation();

  // Carousel State
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  // Auto-scroll Effect
  useEffect(() => {
    const timer = setInterval(() => {
        let nextIndex = activeIndex + 1;
        if (nextIndex >= CAROUSEL_DATA.length) {
            nextIndex = 0;
        }
        
        scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        setActiveIndex(nextIndex);
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(timer);
  }, [activeIndex]);

  useEffect(() => {
    dispatch(loginStart()); // Clear error and loading state on mount
  }, []);

  useEffect(() => {
    if (authError) {
      showToast(authError, "error");
      dispatch(clearError());
    }
  }, [authError]);



  const validateForm = () => {

    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    dispatch(loginStart());
  
    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
  
      switch (result.type) {
        case "NAVIGATE_TO_DASHBOARD":
          navigation.reset({
            index: 0,
            routes: [{ name: RouterConstants.MainTabs }],
          });
          break;

  
        case "NAVIGATE_TO_TENANT_SELECTION":
          navigation.navigate("TenantSelectionScreen");
          break;
  
        case "NAVIGATE_TO_FACILITY_SELECTION":
          navigation.navigate("FacilitySelectionScreen");
          break;
  
        default:
          showToast("Unexpected response from server", "error");
      }
    } catch (error) {
      // Error is already handled by useLoginMutation's onError and the useEffect toast
      console.log('Login error caught in component:', error.message);
    }
  };


  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top+10 }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel Section */}
        <View style={styles.carouselContainer}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {CAROUSEL_DATA.map((item) => (
                    <CarouselItem key={item.id} item={item} />
                ))}
            </ScrollView>
            
            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {CAROUSEL_DATA.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: index === activeIndex ? colors.primary : colors.gray300 }
                        ]}
                    />
                ))}
            </View>
        </View>

        {/* Header - Simplified as main branding is in carousel now */}
        <View style={styles.header}>
            {/* Keeping the circle icon if desired, or removing it since carousel has images */}
            {/* <View style={styles.iconCircle}>
                 <MaterialIcons name="local-hospital" size={48} color={colors.primary} />
            </View> */}

          <Text style={[typography.h2, styles.title]}>Login</Text>
          {/* <Text style={[typography.bodySm, styles.subtitle]}>Doctor Portal</Text> */}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Email Address"
            placeholder="doctor@clinic.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            style={styles.input}
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            style={styles.input}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loginMutation.isPending}
            style={styles.button}
          />


          {/* Error text removed - now shown via Toast */}

        </View>

        {/* Demo Credentials */}
        {/* <View style={styles.demoSection}>
          <Text style={[typography.caption, styles.demoTitle]}>Demo Login</Text>
          <Text style={[typography.caption, styles.demoText]}>
            Use any email and password (min 6 chars)
          </Text>
          <Text style={[typography.caption, styles.demoExample]}>
            Example: demo@clinic.com / password123
          </Text>
        </View> */}

        {/* Footer */}
        <View style={styles.footer}>
          {/* <Text style={[typography.bodySm, styles.footerText]}>
            This is a demo app with sample data
          </Text> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    // justifyContent: 'space-between', // Changed to standard flow
    paddingBottom: spacing.xxl,
  },
  
  // Carousel Styles
  carouselContainer: {
    height: 300, 
    marginBottom: spacing.lg,
    backgroundColor: '#fff', // Light background for carousel area
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  carouselItem: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  carouselImage: {
    width: width * 0.7,
    height: 180,
    marginBottom: spacing.md,
  },
  carouselTextContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  carouselTitle: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  carouselDesc: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    // marginTop: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
    paddingHorizontal: spacing.lg, // Added padding here as it was removed from scrollContent
  },
  input: {
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
    marginTop: spacing.md,
  },
  demoSection: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  demoTitle: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  demoText: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  demoExample: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
