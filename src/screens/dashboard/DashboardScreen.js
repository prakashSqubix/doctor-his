import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Dimensions
} from "react-native";
import { LogoutIcon } from '../../../assets/svg';
// CHECK THIS PATH: Ensure this matches your project structure
import { colors, spacing, typography, radius, shadows } from '../../Constants/theme';
import RouterConstants from "../../Constants/RouterConstants";
import { useLogoutMutation } from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

// Icons commented out as per original file
// import { ... } from "lucide-react-native";

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("dashboard");
  const logoutMutation = useLogoutMutation();
  const navigation = useNavigation()
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              // Navigation will be handled automatically by AuthNavigator
              navigation.reset({
                index: 0,
                routes: [{ name: RouterConstants.LoginScreen }],
              });
            } catch (error) {
              // Even if API fails, we still logout locally
              navigation.reset({
                index: 0,
                routes: [{ name: RouterConstants.LoginScreen }],
              });
            }
          },
        },
      ]
    );
  };
  const [avatarUri, setAvatarUri] = useState(
    "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?w=900"
  );
  const doctor = {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?w=900",
    facilities: ["City General Hospital", "MediCare Clinic", "Heart Health Center"],
  };

  const stats = {
    todayAppointments: 12,
    totalPatients: 248,
    completed: 8,
    pending: 4,
  };

  const appointments = [
    { id: 1, patient: "John Smith", time: "09:00 AM", type: "Follow-up", avatar: "https://images.unsplash.com/photo-1629216509258-4dbd7880e605?w=900" },
    { id: 2, patient: "Emma Wilson", time: "10:30 AM", type: "New Consultation", avatar: "https://images.unsplash.com/photo-1600675608140-991fcf38cc6e?w=900" },
    { id: 3, patient: "Michael Brown", time: "02:15 PM", type: "Check-up", avatar: "https://images.unsplash.com/photo-1660142107232-e26dd2036dd8?w=900" },
    { id: 4, patient: "Lisa Davis", time: "04:00 PM", type: "Emergency", avatar: "https://images.unsplash.com/photo-1675351085230-ab39b2289ff4?w=900" },
  ];

  const recentEMRs = [
    { id: 1, patient: "Robert Johnson", date: "2023-06-15", condition: "Hypertension" },
    { id: 2, patient: "Jennifer Lee", date: "2023-06-14", condition: "Arrhythmia" },
    { id: 3, patient: "Thomas Miller", date: "2023-06-12", condition: "Angina" },
  ];

  const handleAvatarUpload = () => {
    Alert.alert("Upload Photo", "Choose an option to upload your profile photo", [
      { text: "Take Photo", onPress: () => console.log("Take photo pressed") },
      { text: "Choose from Gallery", onPress: () => console.log("Gallery pressed") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header,{paddingTop:insets.top}]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Good Morning,</Text>
            <Text style={styles.headerName}>{user?.fullName ? user.fullName.split(' ')[0] : 'Doctor'}</Text>
          </View>

          <TouchableOpacity style={styles.avatarContainer} onPress={handleLogout}>

          <LogoutIcon fill={colors.error} />
            {/* <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              <Camera color="white" size={14} />
            </View> */}
          </TouchableOpacity>
        </View>

        <View style={styles.facilitiesContainer}>
          <Text style={styles.facilitiesLabel}>Facilities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilitiesScroll}>
            {doctor.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityChip}>
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          {/* Added shadows.sm here */}
          <TouchableOpacity style={[styles.statCard, shadows.sm]} >
            <View style={styles.statContent}>
              <View style={[styles.iconBox, styles.bgPrimaryLight]}>
                {/* <Calendar color={colors.primary} size={20} /> */}
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Today</Text>
                <Text style={styles.statValue}>{stats.todayAppointments}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Added shadows.sm here */}
          <TouchableOpacity style={[styles.statCard, shadows.sm]}>
            <View style={styles.statContent}>
              <View style={[styles.iconBox, styles.bgSuccessLight]}>
                {/* <Users color={colors.success} size={20} /> */}
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Patients</Text>
                <Text style={styles.statValue}>{stats.totalPatients}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {/* Added shadows.sm here */}
          <TouchableOpacity style={[styles.statCard, shadows.sm]}>
            <View style={styles.statContentJustified}>
              <View>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
              </View>
              <View style={[styles.iconBox, styles.bgSuccessLight]}>
                {/* <Stethoscope color={colors.success} size={20} /> */}
              </View>
            </View>
          </TouchableOpacity>

          {/* Added shadows.sm here */}
          <TouchableOpacity style={[styles.statCard, shadows.sm]}>
            <View style={styles.statContentJustified}>
              <View>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={[styles.statValue, { color: colors.warning }]}>{stats.pending}</Text>
              </View>
              <View style={[styles.iconBox, styles.bgWarningLight]}>
                {/* <Clock color={colors.warning} size={20} /> */}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body Scroll */}
      <ScrollView style={styles.bodyScroll}>
        {/* Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              {/* <ChevronRight color={colors.info} size={16} /> */}
            </TouchableOpacity>
          </View>

          {/* Added shadows.sm here */}
          <View style={[styles.cardList, shadows.sm]}>
            {appointments.map((appointment, index) => (
              <TouchableOpacity 
                key={appointment.id} 
                style={[
                  styles.appointmentRow, 
                  index === appointments.length - 1 && styles.lastRow
                ]}
                onPress={()=>navigation.navigate(RouterConstants.PatientDetailsScreen)}
              >
                <Image source={{ uri: appointment.avatar }} style={styles.listAvatar} />
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{appointment.patient}</Text>
                  <Text style={styles.listSubtitle}>{appointment.type}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.listTitle}>{appointment.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent EMRs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent EMRs</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              {/* <ChevronRight color={colors.info} size={16} /> */}
            </TouchableOpacity>
          </View>

          {/* Added shadows.sm here */}
          <View style={[styles.cardList, shadows.sm]}>
            {recentEMRs.map((emr, index) => (
              <TouchableOpacity 
                key={emr.id} 
                style={[
                  styles.appointmentRow, 
                  index === recentEMRs.length - 1 && styles.lastRow
                ]}
              >
                <View style={[styles.iconBox, styles.bgPrimaryLight]}>
                  {/* <FileText color={colors.primary} size={20} /> */}
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{emr.patient}</Text>
                  <Text style={styles.listSubtitle}>{emr.condition}</Text>
                </View>
                <Text style={styles.listSubtitle}>{emr.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Quick Actions</Text>
          <View style={styles.statsRow}>
            {/* Added shadows.sm here */}
            <TouchableOpacity onPress={()=>navigation.navigate(RouterConstants.EmrGenerationScreen)} style={[styles.statCard, shadows.sm]}>
              <View style={styles.centerContent}>
                <View style={[styles.largeIconCircle, styles.bgPrimaryLight]}>
                  {/* <FileText size={24} color={colors.primary} /> */}
                </View>
                <Text style={styles.actionLabel}>Generate EMR</Text>
              </View>
            </TouchableOpacity>

            {/* Added shadows.sm here */}
            <TouchableOpacity style={[styles.statCard, shadows.sm]}>
              <View style={styles.centerContent}>
                <View style={[styles.largeIconCircle, styles.bgSuccessLight]}>
                  {/* <Stethoscope size={24} color={colors.success} /> */}
                </View>
                <Text style={styles.actionLabel}>Prescription</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Assistant */}
        <View style={styles.aiCard}>
          <View style={styles.aiContent}>
            <View style={styles.aiIconBox}>
              {/* <MessageSquare color="white" size={24} /> */}
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI Medical Assistant</Text>
              <Text style={styles.aiSubtitle}>Generate EMRs with AI</Text>
            </View>
          </View>
        </View>
        
        {/* Spacer for bottom tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100, 
  },
  // Header
  header: {
    backgroundColor: colors.primary,
    // paddingTop: spacing.xxl, 
    paddingBottom: spacing.lg, 
    paddingHorizontal: spacing.md, 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreeting: {
    color: colors.white,
    ...typography.h3, 
    fontSize: 24, 
  },
  headerName: {
    color: colors.white,
    ...typography.h4, 
    fontWeight: '400',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.info,
    borderRadius: radius.full,
    padding: 4,
  },
  facilitiesContainer: {
    marginTop: spacing.lg, 
  },
  facilitiesLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    ...typography.bodySm,
  },
  facilitiesScroll: {
    marginTop: spacing.sm,
  },
  facilityChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  facilityText: {
    color: colors.white,
    ...typography.bodySm,
  },
  
  // Stats
  statsContainer: {
    paddingHorizontal: spacing.md,
    marginTop: -32, 
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12, 
    marginBottom: 12,
  },
  // REMOVED ...shadows.sm FROM HERE
  statCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flex: 1,
    minWidth: '45%',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContentJustified: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  largeIconCircle: {
    padding: 12,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  bgPrimaryLight: { backgroundColor: colors.primaryLight },
  bgSuccessLight: { backgroundColor: '#DCFCE7' }, 
  bgWarningLight: { backgroundColor: '#FEF3C7' }, 
  
  statInfo: {
    marginLeft: spacing.sm,
  },
  statLabel: {
    color: colors.gray500,
    ...typography.bodySm,
  },
  statValue: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.text,
  },
  centerContent: {
    alignItems: 'center',
  },
  actionLabel: {
    ...typography.bodyBold,
  },

  // Body
  bodyScroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4, 
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.info,
    marginRight: 4,
  },
  // REMOVED ...shadows.sm FROM HERE
  cardList: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  listContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  listTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  listSubtitle: {
    ...typography.bodySm,
    color: colors.gray500,
  },
  listRight: {
    alignItems: 'flex-end',
  },

  // AI Card
  aiCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.sm,
    borderRadius: radius.full,
  },
  aiTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  aiTitle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  aiSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    ...typography.caption,
    marginTop: 4,
    color: colors.gray500, 
  },
  // REMOVED ...shadows.md FROM HERE
  fab: {
    backgroundColor: colors.info,
    borderRadius: radius.full,
    padding: 12,
    marginTop: -24,
  },
});

export default DashboardScreen;