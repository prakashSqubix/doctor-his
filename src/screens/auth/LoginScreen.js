import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { TextInput, Button } from '../../components';
import { colors, spacing, typography, radius } from '../../Constants/theme';
import { useLoginMutation } from '../../hooks/useAuth';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('milan.mohapatra@squbix.com');
  const [password, setPassword] = useState('Milan@123');
  // const [email, setEmail] = useState('deepak.senapati@squbix.com');
  // const [password, setPassword] = useState('99999999');
  const [errors, setErrors] = useState({});
  
  const { error: authError } = useSelector((state) => state.auth);
  const loginMutation = useLoginMutation();

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
  
    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
  
      switch (result.type) {
        case "NAVIGATE_TO_DASHBOARD":
          navigation.reset({
            index: 0,
            routes: [{ name: "DashboardScreen" }],
          });
          break;
  
        case "NAVIGATE_TO_TENANT_SELECTION":
          navigation.navigate("TenantSelectionScreen");
          break;
  
        case "NAVIGATE_TO_FACILITY_SELECTION":
          navigation.navigate("FacilitySelectionScreen");
          break;
  
        default:
          Alert.alert("Error", "Unexpected response from server");
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        "Invalid email or password."
      );
    //   Alert.alert(
    //     "Login Failed",
    //     error.message || "Invalid email or password."
    //   );
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            {/* <MaterialIcons name="local-hospital" size={48} color={colors.primary} /> */}
          </View>

          <Text style={[typography.h2, styles.title]}>MedCare</Text>
          <Text style={[typography.bodySm, styles.subtitle]}>Doctor Portal</Text>
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

          {authError && (
            <Text style={styles.errorText}>{authError}</Text>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
