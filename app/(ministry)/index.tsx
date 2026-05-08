import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORY_COLORS } from '@/constants/data';
import { fetchClubs } from '@/services/clubs';
import { getAllUpdates } from '@/services/updates';
import { getAllEvents } from '@/services/events';
import { useProfile } from '@/hooks/useProfile';
import type { Club, ClubUpdate, ClubEvent } from '@/constants/data';

export default function MinistryOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [updates, setUpdates] = useState<ClubUpdate[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [c, u, e] = await Promise.all([fetchClubs(), getAllUpdates(), getAllEvents()]);
    setClubs(c); setUpdates(u); setEvents(e);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const activeClubs = clubs.filter(c => c.is_active).length;
  const totalMembers = clubs.reduce((s, c) => s + c.members_count, 0);
  const catCounts = clubs.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Ministry of Clubs & Societies</Text>
          <Text style={styles.headerTitle}>Overview</Text>
        </View>
        <View style={styles.ministryBadge}>
          <MaterialIcons name="account-balance" size={18} color={Colors.primary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeGreet}>Welcome, {profile?.full_name?.split(' ')[0] || 'Administrator'}</Text>
          <Text style={styles.welcomeDesc}>Here is a complete overview of all clubs and societies at NUST.</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Clubs', value: clubs.length, icon: 'group-work' as const, color: Colors.primary },
            { label: 'Active Clubs', value: activeClubs, icon: 'check-circle' as const, color: Colors.success },
            { label: 'Total Members', value: totalMembers, icon: 'people' as const, color: Colors.info },
            { label: 'Upcoming Events', value: events.length, icon: 'event' as const, color: Colors.tech },
            { label: 'Total Posts', value: updates.length, icon: 'campaign' as const, color: Colors.cultural },
            { label: 'Inactive Clubs', value: clubs.length - activeClubs, icon: 'cancel' as const, color: Colors.error },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { borderColor: stat.color + '33' }]}>
              <MaterialIcons name={stat.icon} size={22} color={stat.color} />
              <Text style={[styles.statVal, { color: stat.color }]}>{stat.value.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clubs by Category</Text>
          <View style={styles.breakdownCard}>
            {Object.entries(catCounts).map(([cat, count]) => {
              const pct = Math.round((count / clubs.length) * 100);
              const color = CATEGORY_COLORS[cat] || Colors.primary;
              return (
                <View key={cat} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <Text style={styles.catName}>{cat}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.catCount, { color }]}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Activity</Text>
          {updates.slice(0, 5).map(u => {
            const catColor = CATEGORY_COLORS[u.club?.name || ''] || Colors.primary;
            return (
              <View key={u.id} style={styles.actCard}>
                <View style={[styles.actDot, { backgroundColor: u.club?.cover_color || Colors.primary }]} />
                <View style={styles.actContent}>
                  <Text style={styles.actClub}>{u.club?.short_name || 'Club'}</Text>
                  <Text style={styles.actTitle}>{u.title}</Text>
                  <Text style={styles.actDate}>{new Date(u.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            );
          })}
          {updates.length === 0 && <View style={styles.emptyCard}><Text style={styles.emptyCardText}>No activity yet across clubs.</Text></View>}
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
  ministryBadge: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primary + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.primary + '44' },
  welcomeCard: { margin: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '33' },
  welcomeGreet: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  welcomeDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm, gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: { flex: 1, minWidth: '30%', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.sm, alignItems: 'center', gap: 4, borderWidth: 1 },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  breakdownCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceBorder },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { color: Colors.textSecondary, fontSize: FontSize.sm, width: 75 },
  barTrack: { flex: 1, height: 6, backgroundColor: Colors.surface, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  catCount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, width: 20, textAlign: 'right' },
  actCard: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  actDot: { width: 3, borderRadius: 2, minHeight: 50 },
  actContent: { flex: 1, backgroundColor: Colors.surfaceCard, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder },
  actClub: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  actTitle: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.semibold, marginTop: 2 },
  actDate: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4 },
  emptyCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, alignItems: 'center' },
  emptyCardText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
