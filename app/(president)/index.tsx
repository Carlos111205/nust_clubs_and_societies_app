import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORY_COLORS } from '@/constants/data';
import { fetchClubByPresidentId } from '@/services/clubs';
import { getPendingRequests, getClubMembers } from '@/services/memberships';
import { getClubUpdates } from '@/services/updates';
import { getClubEvents } from '@/services/events';
import { useProfile } from '@/hooks/useProfile';
import type { Club, ClubUpdate } from '@/constants/data';

export default function PresidentDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [club, setClub] = useState<Club | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [recentUpdates, setRecentUpdates] = useState<ClubUpdate[]>([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const clubData = await fetchClubByPresidentId(user.id);
    if (clubData) {
      setClub(clubData);
      const [pending, members, updates, events] = await Promise.all([
        getPendingRequests(clubData.id),
        getClubMembers(clubData.id),
        getClubUpdates(clubData.id),
        getClubEvents(clubData.id),
      ]);
      setPendingCount(pending.length);
      setMemberCount(members.length);
      setRecentUpdates(updates.slice(0, 3));
      setEventsCount(events.length);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  if (!club) return (
    <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }]}>
      <MaterialIcons name="error-outline" size={64} color={Colors.error} />
      <Text style={styles.noClubText}>No club assigned to your account. Contact the Ministry of Clubs & Societies.</Text>
    </View>
  );

  const catColor = CATEGORY_COLORS[club.category] || Colors.primary;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>President Dashboard</Text>
          <Text style={styles.headerTitle}>{club.short_name}</Text>
        </View>
        <View style={[styles.clubBadge, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '44' }]}>
          <Text style={[styles.clubLetter, { color: club.cover_color }]}>{club.icon_letter}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {/* Club Info */}
        <View style={[styles.clubCard, { borderColor: catColor + '44' }]}>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.clubDesc}>{club.description}</Text>
          <View style={styles.clubMeta}>
            <View style={[styles.catPill, { backgroundColor: catColor + '18' }]}><Text style={[styles.catPillText, { color: catColor }]}>{club.category}</Text></View>
            <View style={[styles.statusPill, { backgroundColor: club.is_active ? Colors.success + '18' : Colors.error + '18' }]}>
              <MaterialIcons name={club.is_active ? 'check-circle' : 'cancel'} size={12} color={club.is_active ? Colors.success : Colors.error} />
              <Text style={[styles.statusPillText, { color: club.is_active ? Colors.success : Colors.error }]}>{club.is_active ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Members', value: memberCount, icon: 'group' as const, color: catColor },
            { label: 'Pending', value: pendingCount, icon: 'person-add' as const, color: Colors.warning },
            { label: 'Posts', value: recentUpdates.length, icon: 'campaign' as const, color: Colors.info },
            { label: 'Events', value: eventsCount, icon: 'event' as const, color: Colors.success },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { borderColor: stat.color + '33' }]}>
              <MaterialIcons name={stat.icon} size={22} color={stat.color} />
              <Text style={[styles.statVal, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Pending Requests Alert */}
        {pendingCount > 0 && (
          <View style={styles.alertBanner}>
            <MaterialIcons name="notifications-active" size={20} color={Colors.warning} />
            <Text style={styles.alertText}>
              <Text style={{ fontWeight: FontWeight.bold, color: Colors.warning }}>{pendingCount} pending</Text> join request{pendingCount !== 1 ? 's' : ''} need your review
            </Text>
          </View>
        )}

        {/* Recent Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          {recentUpdates.length === 0
            ? <View style={styles.emptyCard}><Text style={styles.emptyCardText}>No posts yet. Share an update with your members!</Text></View>
            : recentUpdates.map(u => (
              <View key={u.id} style={styles.updateCard}>
                <Text style={styles.updateTitle}>{u.title}</Text>
                <Text style={styles.updateContent} numberOfLines={2}>{u.content}</Text>
                <Text style={styles.updateDate}>{new Date(u.created_at).toLocaleDateString()}</Text>
              </View>
            ))}
        </View>

        {/* Meeting Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Info</Text>
          <View style={styles.infoCard}>
            {[
              { icon: 'today' as const, label: 'Day', value: club.meeting_day },
              { icon: 'access-time' as const, label: 'Time', value: club.meeting_time },
              { icon: 'location-on' as const, label: 'Venue', value: club.location },
              { icon: 'email' as const, label: 'Email', value: club.email },
            ].map((row, i) => (
              <View key={row.label} style={[styles.infoRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.surfaceBorder }]}>
                <MaterialIcons name={row.icon} size={16} color={Colors.textMuted} />
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />

        {/* Credits Footer */}
        <View style={{ alignItems: 'center', marginBottom: 20, opacity: 0.5 }}>
          <Text style={{ color: Colors.textMuted, fontSize: 10, fontWeight: '500' }}>
            Created by Carlos Chirenda and Group 5
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  clubBadge: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  clubLetter: { fontSize: 20, fontWeight: FontWeight.extrabold },
  clubCard: { margin: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1 },
  clubName: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: 4 },
  clubDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.sm },
  clubMeta: { flexDirection: 'row', gap: Spacing.sm },
  catPill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  catPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm, gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, minWidth: '44%', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4, borderWidth: 1 },
  statVal: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.md, marginBottom: Spacing.md, backgroundColor: Colors.warning + '18', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '44' },
  alertText: { flex: 1, color: Colors.textSecondary, fontSize: FontSize.sm },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  emptyCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder },
  emptyCardText: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
  updateCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceBorder },
  updateTitle: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.semibold, marginBottom: 4 },
  updateContent: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 18 },
  updateDate: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 6 },
  infoCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  infoLabel: { color: Colors.textMuted, fontSize: FontSize.sm, width: 50 },
  infoValue: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.medium, textAlign: 'right' },
  noClubText: { color: Colors.textSecondary, fontSize: FontSize.body, textAlign: 'center', lineHeight: 24, marginTop: Spacing.md },
});
