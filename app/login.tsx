import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { setupProfile } from '@/services/profile';
import { fetchClubs, assignPresidentToClub } from '@/services/clubs';
import type { Club, Role } from '@/constants/data';

const AVATAR_COLORS = ['#FFD700', '#9B6BFF', '#4DA6FF', '#22D76A', '#FF6BA8', '#FF9B3D', '#3DDCFF'];
const MINISTRY_CODE = 'MCS2024';

type AuthMode = 'login' | 'register';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signInWithPassword, sendOTP, verifyOTPAndLogin, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [mode, setMode] = useState<AuthMode>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Register state
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [ministryCode, setMinistryCode] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubsLoaded, setClubsLoaded] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingUserId, setPendingUserId] = useState('');

  const avatarColor = AVATAR_COLORS[fullName.length % AVATAR_COLORS.length];

  const loadClubs = async () => {
    if (!clubsLoaded) {
      const data = await fetchClubs();
      setClubs(data);
      setClubsLoaded(true);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'club_president') loadClubs();
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showAlert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    
    // Using signInWithPassword as the primary login method
    const { error } = await signInWithPassword(loginEmail.trim().toLowerCase(), loginPassword);
    
    if (error) {
      // If password login fails, we could potentially offer OTP login as a fallback
      // but for now we follow the existing pattern
      showAlert('Login Failed', error);
      return;
    }
    router.replace('/');
  };

  const handleSendOTP = async () => {
    if (!fullName.trim()) { showAlert('Required', 'Please enter your full name.'); return; }
    if (!regEmail.trim()) { showAlert('Required', 'Please enter your email.'); return; }
    if (!regPassword || regPassword.length < 6) { showAlert('Weak Password', 'Password must be at least 6 characters.'); return; }
    if (regPassword !== regConfirm) { showAlert('Mismatch', 'Passwords do not match.'); return; }
    if (selectedRole === 'ministry' && ministryCode !== MINISTRY_CODE) {
      showAlert('Invalid Code', 'The ministry access code is incorrect.'); return;
    }
    if (selectedRole === 'club_president' && !selectedClubId) {
      showAlert('Select Club', 'Please select the club you will manage.'); return;
    }

    // Using OTP for registration verification
    const { error } = await sendOTP(regEmail.trim().toLowerCase());
    
    if (error) { 
      showAlert('Error', error); 
      return; 
    }
    
    setOtpStep(true);
    showAlert('OTP Sent', `A verification code has been sent to ${regEmail}.`);
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) { showAlert('Required', 'Please enter the OTP.'); return; }
    const { error, user } = await verifyOTPAndLogin(regEmail.trim().toLowerCase(), otp.trim(), { password: regPassword });
    if (error) { showAlert('Verification Failed', error); return; }
    if (!user) { showAlert('Error', 'Could not create account. Please try again.'); return; }

    const { error: profileError } = await setupProfile(user.id, {
      full_name: fullName.trim(),
      student_id: studentId.trim(),
      role: selectedRole,
      club_id: selectedRole === 'club_president' ? selectedClubId : undefined,
      avatar_color: avatarColor,
    });

    if (!profileError && selectedRole === 'club_president' && selectedClubId) {
      await assignPresidentToClub(selectedClubId, user.id);
    }

    if (profileError) {
      console.error('[Login] Profile setup error:', profileError);
      showAlert('Profile Error', profileError);
      return;
    }

    console.log('[Login] Registration successful, role:', selectedRole);
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.root, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.nustBadge}>
            <Text style={styles.nustText}>NUST</Text>
          </View>
          <Text style={styles.appTitle}>Clubs & Societies</Text>
          <Text style={styles.appSub}>Connect. Explore. Belong.</Text>
        </View>

        {/* Mode Tabs */}
        <View style={styles.modeTabs}>
          <Pressable
            onPress={() => { setMode('login'); setOtpStep(false); }}
            style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>Sign In</Text>
          </Pressable>
          <Pressable
            onPress={() => { setMode('register'); setOtpStep(false); }}
            style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>Register</Text>
          </Pressable>
        </View>

        {/* Login Form */}
        {mode === 'login' && (
          <View style={styles.form}>
            <InputField
              label="Email Address"
              icon="email"
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Password"
              icon="lock"
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="Enter password"
              secureTextEntry={!showLoginPwd}
              rightIcon={showLoginPwd ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowLoginPwd(v => !v)}
            />
            <Pressable
              onPress={handleLogin}
              disabled={operationLoading}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              {operationLoading
                ? <ActivityIndicator color={Colors.textOnPrimary} />
                : <Text style={styles.primaryBtnText}>Sign In</Text>}
            </Pressable>
          </View>
        )}

        {/* Register Form */}
        {mode === 'register' && !otpStep && (
          <View style={styles.form}>
            <InputField
              label="Full Name"
              icon="person"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Carlos Chirenda"
              autoCapitalize="words"
            />
            <InputField
              label="Student / Staff ID (optional)"
              icon="badge"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="e.g. N02123456A"
              keyboardType="numeric"
            />
            <InputField
              label="Email Address"
              icon="email"
              value={regEmail}
              onChangeText={setRegEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Password"
              icon="lock"
              value={regPassword}
              onChangeText={setRegPassword}
              placeholder="Min 8 characters"
              secureTextEntry={!showRegPwd}
              rightIcon={showRegPwd ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowRegPwd(v => !v)}
            />
            <InputField
              label="Confirm Password"
              icon="lock-outline"
              value={regConfirm}
              onChangeText={setRegConfirm}
              placeholder="Repeat password"
              secureTextEntry={!showRegPwd}
            />

            {/* Role Selection */}
            <Text style={styles.fieldLabel}>Account Type</Text>
            <View style={styles.roleGrid}>
              <RoleCard
                role="student"
                icon="school"
                label="Student"
                desc="Browse & join clubs"
                selected={selectedRole === 'student'}
                onPress={() => handleRoleSelect('student')}
              />
              <RoleCard
                role="club_president"
                icon="manage-accounts"
                label="Club President"
                desc="Manage your club"
                selected={selectedRole === 'club_president'}
                onPress={() => handleRoleSelect('club_president')}
              />
              <RoleCard
                role="ministry"
                icon="account-balance"
                label="Ministry"
                desc="Oversee all clubs"
                selected={selectedRole === 'ministry'}
                onPress={() => handleRoleSelect('ministry')}
              />
            </View>

            {/* Club Selection for Presidents */}
            {selectedRole === 'club_president' && (
              <View style={styles.clubSelect}>
                <Text style={styles.fieldLabel}>Select Your Club</Text>
                {!clubsLoaded
                  ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 8 }} />
                  : clubs.map(club => (
                    <Pressable
                      key={club.id}
                      onPress={() => setSelectedClubId(club.id)}
                      style={[styles.clubOption, selectedClubId === club.id && styles.clubOptionSelected]}
                    >
                      <View style={[styles.clubOptionIcon, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '55' }]}>
                        <Text style={[styles.clubOptionLetter, { color: club.cover_color }]}>{club.icon_letter}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.clubOptionName}>{club.short_name}</Text>
                        <Text style={styles.clubOptionFull} numberOfLines={1}>{club.name}</Text>
                      </View>
                      {selectedClubId === club.id && <MaterialIcons name="check-circle" size={20} color={Colors.primary} />}
                    </Pressable>
                  ))
                }
              </View>
            )}

            {/* Ministry Code */}
            {selectedRole === 'ministry' && (
              <InputField
                label="Ministry Access Code"
                icon="vpn-key"
                value={ministryCode}
                onChangeText={setMinistryCode}
                placeholder="Enter ministry code"
                secureTextEntry
              />
            )}

            <Pressable
              onPress={handleSendOTP}
              disabled={operationLoading}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              {operationLoading
                ? <ActivityIndicator color={Colors.textOnPrimary} />
                : <>
                  <Text style={styles.primaryBtnText}>Send Verification Code</Text>
                  <MaterialIcons name="send" size={18} color={Colors.textOnPrimary} />
                </>}
            </Pressable>
          </View>
        )}

        {/* OTP Step */}
        {mode === 'register' && otpStep && (
          <View style={styles.form}>
            <View style={styles.otpHeader}>
              <MaterialIcons name="mark-email-read" size={48} color={Colors.primary} />
              <Text style={styles.otpTitle}>Check Your Email</Text>
              <Text style={styles.otpSub}>
                We sent a 6-digit code to{'\n'}
                <Text style={{ color: Colors.primary }}>{regEmail}</Text>
              </Text>
            </View>
            <InputField
              label="Verification Code"
              icon="pin"
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit code"
              keyboardType="numeric"
              maxLength={6}
            />
            <Pressable
              onPress={handleVerifyOTP}
              disabled={operationLoading}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              {operationLoading
                ? <ActivityIndicator color={Colors.textOnPrimary} />
                : <Text style={styles.primaryBtnText}>Create Account</Text>}
            </Pressable>
            <Pressable onPress={() => setOtpStep(false)} style={styles.backLink}>
              <MaterialIcons name="arrow-back" size={16} color={Colors.textMuted} />
              <Text style={styles.backLinkText}>Go back and edit</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: insets.bottom + 24 }} />
        {/* Credits Footer */}
        <View style={styles.creditsFooter}>
          <Text style={styles.creditsText}>Created by Carlos Chirenda and Group 5</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label, icon, rightIcon, onRightIconPress, ...props
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  [key: string]: any;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <MaterialIcons name={icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} {...props} />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <MaterialIcons name={rightIcon} size={18} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function RoleCard({
  icon, label, desc, selected, onPress
}: {
  role: Role;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleCard,
        selected && styles.roleCardSelected,
        pressed && { opacity: 0.8 },
      ]}
    >
      <MaterialIcons name={icon} size={24} color={selected ? Colors.primary : Colors.textMuted} />
      <Text style={[styles.roleLabel, selected && { color: Colors.primary }]}>{label}</Text>
      <Text style={styles.roleDesc}>{desc}</Text>
      {selected && <View style={styles.roleCheck}><MaterialIcons name="check" size={12} color={Colors.textOnPrimary} /></View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md },
  header: { alignItems: 'center', paddingVertical: Spacing.xl },
  nustBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  nustText: { color: Colors.textOnPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, letterSpacing: 3 },
  appTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  appSub: { color: Colors.textMuted, fontSize: FontSize.body, marginTop: 4 },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modeTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.md },
  modeTabActive: { backgroundColor: Colors.primary },
  modeTabText: { color: Colors.textMuted, fontSize: FontSize.body, fontWeight: FontWeight.semibold },
  modeTabTextActive: { color: Colors.textOnPrimary },
  form: { gap: Spacing.md },
  inputGroup: { gap: 6 },
  fieldLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  inputIcon: {},
  input: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.body, padding: 0 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  primaryBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  roleGrid: { flexDirection: 'row', gap: Spacing.sm },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    position: 'relative',
  },
  roleCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '18' },
  roleLabel: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: FontWeight.bold, textAlign: 'center' },
  roleDesc: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },
  roleCheck: {
    position: 'absolute',
    top: 4, right: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 16, height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubSelect: { gap: Spacing.sm },
  clubOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
  },
  clubOptionSelected: { borderColor: Colors.primary },
  clubOptionIcon: {
    width: 36, height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  clubOptionLetter: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  clubOptionName: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  clubOptionFull: { color: Colors.textMuted, fontSize: FontSize.xs },
  otpHeader: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  otpTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  otpSub: { color: Colors.textSecondary, fontSize: FontSize.body, textAlign: 'center', lineHeight: 22 },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.sm },
  backLinkText: { color: Colors.textMuted, fontSize: FontSize.sm },
  creditsFooter: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    alignItems: 'center',
    opacity: 0.6,
  },
  creditsText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
});
