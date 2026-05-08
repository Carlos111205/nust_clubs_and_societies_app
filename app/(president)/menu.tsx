import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';

const MENU_ITEMS = [
  { icon: 'dashboard' as const, label: 'Club Dashboard', desc: 'Overview and stats', route: '/(president)' as const },
  { icon: 'person-add' as const, label: 'Join Requests', desc: 'Approve or reject members', route: '/(president)/requests' as const },
  { icon: 'campaign' as const, label: 'Post Update', desc: 'Share news with members', route: '/(president)/updates' as const },
  { icon: 'group' as const, label: 'Members', desc: 'View all club members', route: '/(president)/members' as const },
  { icon: 'help-outline' as const, label: 'Help & Guidelines', desc: 'Club president handbook', route: null },
  { icon: 'contact-mail' as const, label: 'Contact Ministry', desc: 'Reach the MCS office', route: null },
];

export default function PresidentMenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, profileLoading } = useProfile();
  const { showAlert } = useAlert();

  const handleLogout = () => {
    showAlert('Sign Out', 'Sign out of your president account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/login' as any); } },
    ]);
  };

  const initials = profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'P';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.headerTitle}>Menu</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: profile?.avatar_color || Colors.primary }]}>
            {profileLoading ? <ActivityIndicator color={Colors.textOnPrimary} /> : <Text style={styles.avatarText}>{initials}</Text>}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || 'President'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: Colors.info + '22', borderColor: Colors.info + '44' }]}>
            <MaterialIcons name="manage-accounts" size={14} color={Colors.info} />
            <Text style={[styles.roleText, { color: Colors.info }]}>President</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Navigation</Text>
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => item.route ? router.push(item.route as any) : showAlert('Coming Soon', `${item.label} will be available soon.`)}
              style={({ pressed }) => [styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuBorder, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.info + '18' }]}>
                <MaterialIcons name={item.icon} size={20} color={Colors.info} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuCard}>
          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}>
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.error + '18' }]}>
              <MaterialIcons name="logout" size={20} color={Colors.error} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: Colors.error }]}>Sign Out</Text>
              <Text style={styles.menuDesc}>Log out of your account</Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.footer}>NUST Clubs & Societies • Club President Portal</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  profileCard: { margin: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.info + '33' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: Colors.textOnPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  profileEmail: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  sectionLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: Spacing.md, marginBottom: Spacing.xs, marginTop: Spacing.md },
  menuCard: { marginHorizontal: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.surfaceBorder, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  menuIconWrap: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.semibold },
  menuDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  footer: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', paddingVertical: Spacing.xl },
});
