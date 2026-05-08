import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORY_COLORS, type ClubMembership } from '@/constants/data';
import { getMyMemberships } from '@/services/memberships';

export default function MyClubsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const load = useCallback(async () => {
    if (!user) return;
    const data = await getMyMemberships(user.id);
    setMemberships(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = memberships.filter(m => filter === 'all' || m.status === filter);
  const approvedCount = memberships.filter(m => m.status === 'approved').length;
  const pendingCount = memberships.filter(m => m.status === 'pending').length;

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Your memberships</Text>
          <Text style={styles.headerTitle}>My Clubs</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={[styles.statNum, { color: Colors.success }]}>{approvedCount}</Text><Text style={styles.statLabel}>Joined</Text></View>
          <View style={styles.statItem}><Text style={[styles.statNum, { color: Colors.warning }]}>{pendingCount}</Text><Text style={styles.statLabel}>Pending</Text></View>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(['all', 'approved', 'pending'] as const).map(f => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'all' ? 'All' : f === 'approved' ? 'Members' : 'Pending'}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />} contentContainerStyle={{ padding: Spacing.md }}>
        {filtered.length === 0
          ? <View style={styles.empty}>
            <MaterialIcons name="group-off" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{filter === 'all' ? 'No Clubs Yet' : filter === 'approved' ? 'No Active Memberships' : 'No Pending Requests'}</Text>
            <Text style={styles.emptySub}>{filter === 'all' ? 'Browse the Clubs tab and request to join!' : 'Check back later.'}</Text>
          </View>
          : filtered.map(m => {
            const club = m.club;
            if (!club) return null;
            const catColor = CATEGORY_COLORS[club.category] || Colors.primary;
            return (
              <Pressable key={m.id} onPress={() => router.push(`/club/${club.id}` as any)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
                <View style={[styles.cardIcon, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '44' }]}>
                  <Text style={[styles.cardLetter, { color: club.cover_color }]}>{club.icon_letter}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardShort}>{club.short_name}</Text>
                  <Text style={styles.cardName} numberOfLines={1}>{club.name}</Text>
                  <View style={styles.cardMeta}>
                    <View style={[styles.catPill, { backgroundColor: catColor + '18' }]}><Text style={[styles.catPillText, { color: catColor }]}>{club.category}</Text></View>
                    <Text style={styles.cardDate}>Requested {new Date(m.requested_at).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: m.status === 'approved' ? Colors.success + '22' : m.status === 'pending' ? Colors.warning + '22' : Colors.error + '22',
                  borderColor: m.status === 'approved' ? Colors.success + '55' : m.status === 'pending' ? Colors.warning + '55' : Colors.error + '55',
                }]}>
                  <MaterialIcons
                    name={m.status === 'approved' ? 'check-circle' : m.status === 'pending' ? 'schedule' : 'cancel'}
                    size={14}
                    color={m.status === 'approved' ? Colors.success : m.status === 'pending' ? Colors.warning : Colors.error}
                  />
                  <Text style={[styles.statusText, { color: m.status === 'approved' ? Colors.success : m.status === 'pending' ? Colors.warning : Colors.error }]}>
                    {m.status === 'approved' ? 'Member' : m.status === 'pending' ? 'Pending' : 'Rejected'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  filterChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md, backgroundColor: Colors.surfaceCard, borderWidth: 1.5, borderColor: Colors.surfaceBorder },
  filterChipActive: { backgroundColor: Colors.primary + '18', borderColor: Colors.primary },
  filterText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  filterTextActive: { color: Colors.primary },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  cardIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, flexShrink: 0 },
  cardLetter: { fontSize: 22, fontWeight: FontWeight.bold },
  cardInfo: { flex: 1 },
  cardShort: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  cardName: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  catPill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  catPillText: { fontSize: 10, fontWeight: FontWeight.semibold },
  cardDate: { color: Colors.textMuted, fontSize: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  empty: { alignItems: 'center', paddingVertical: 64, gap: Spacing.sm },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
  emptySub: { color: Colors.textMuted, fontSize: FontSize.body, textAlign: 'center' },
});
