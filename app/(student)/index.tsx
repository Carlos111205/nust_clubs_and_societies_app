import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORIES, CATEGORY_COLORS, type Category, type Club, type ClubMembership } from '@/constants/data';
import { fetchClubs } from '@/services/clubs';
import { getMyMemberships, requestToJoin, cancelRequest } from '@/services/memberships';
import { useProfile } from '@/hooks/useProfile';

export default function StudentHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { showAlert } = useAlert();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [clubsData, membershipsData] = await Promise.all([fetchClubs(), getMyMemberships(user.id)]);
    setClubs(clubsData);
    setMemberships(membershipsData);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const getMembershipStatus = (clubId: string) => {
    const m = memberships.find(m => m.club_id === clubId);
    return m ? m.status : null;
  };

  const handleJoinToggle = async (club: Club) => {
    if (!user) return;
    const status = getMembershipStatus(club.id);
    setActionLoading(club.id);
    if (!status) {
      const { error } = await requestToJoin(club.id, user.id);
      if (error) { showAlert('Error', error); } else { showAlert('Request Sent', `Your request to join ${club.short_name} has been submitted.`); await load(); }
    } else if (status === 'pending') {
      showAlert('Cancel Request', `Withdraw your request to join ${club.short_name}?`, [
        { text: 'Keep', style: 'cancel' },
        { text: 'Withdraw', style: 'destructive', onPress: async () => { await cancelRequest(club.id, user.id); await load(); } },
      ]);
    }
    setActionLoading(null);
  };

  const filtered = clubs.filter(c => {
    const matchCat = selected === 'All' || c.category === selected;
    const matchQ = !query.trim() || c.name.toLowerCase().includes(query.toLowerCase()) || c.short_name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });
  const featured = clubs.filter(c => c.is_featured).slice(0, 4);

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreet}>Welcome, {profile?.full_name?.split(' ')[0] || 'Student'} 👋</Text>
          <Text style={styles.headerTitle}>Explore Clubs</Text>
        </View>
        <View style={styles.nustBadge}><Text style={styles.nustBadgeText}>NUST</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={Colors.textMuted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search clubs..." placeholderTextColor={Colors.textMuted} style={styles.searchInput} />
          {query.length > 0 && <Pressable onPress={() => setQuery('')}><MaterialIcons name="close" size={18} color={Colors.textMuted} /></Pressable>}
        </View>

        {/* Featured */}
        {selected === 'All' && !query && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Featured</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}>
              {featured.map(club => {
                const status = getMembershipStatus(club.id);
                return (
                  <Pressable key={club.id} onPress={() => router.push(`/club/${club.id}` as any)} style={({ pressed }) => [styles.featCard, pressed && { opacity: 0.85 }]}>
                    <View style={[styles.featIcon, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '44' }]}>
                      <Text style={[styles.featLetter, { color: club.cover_color }]}>{club.icon_letter}</Text>
                    </View>
                    <Text style={styles.featShort}>{club.short_name}</Text>
                    <Text style={styles.featMembers}>{club.members_count} members</Text>
                    {status && <View style={[styles.featStatus, { backgroundColor: status === 'approved' ? Colors.success + '22' : Colors.warning + '22' }]}>
                      <Text style={[styles.featStatusText, { color: status === 'approved' ? Colors.success : Colors.warning }]}>{status === 'approved' ? 'Member' : 'Pending'}</Text>
                    </View>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: Spacing.sm }}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat} onPress={() => setSelected(cat)} style={[styles.catChip, selected === cat ? { backgroundColor: CATEGORY_COLORS[cat] || Colors.primary, borderColor: CATEGORY_COLORS[cat] || Colors.primary } : styles.catChipDefault]}>
              <Text style={[styles.catChipText, selected === cat ? { color: Colors.textOnPrimary } : { color: CATEGORY_COLORS[cat] || Colors.primary }]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Club List */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{selected === 'All' ? 'All Clubs' : `${selected} Clubs`}</Text>
            <Text style={styles.countBadge}>{filtered.length}</Text>
          </View>
          {filtered.length === 0
            ? <View style={styles.empty}><MaterialIcons name="search-off" size={48} color={Colors.textMuted} /><Text style={styles.emptyText}>No clubs found</Text></View>
            : filtered.map(club => {
              const status = getMembershipStatus(club.id);
              const catColor = CATEGORY_COLORS[club.category] || Colors.primary;
              return (
                <Pressable key={club.id} onPress={() => router.push(`/club/${club.id}` as any)} style={({ pressed }) => [styles.clubCard, pressed && { opacity: 0.9 }]}>
                  <View style={[styles.clubIcon, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '44' }]}>
                    <Text style={[styles.clubLetter, { color: club.cover_color }]}>{club.icon_letter}</Text>
                  </View>
                  <View style={styles.clubInfo}>
                    <View style={styles.clubTitleRow}>
                      <Text style={styles.clubShort}>{club.short_name}</Text>
                      {!club.is_active && <View style={styles.inactiveBadge}><Text style={styles.inactiveText}>Inactive</Text></View>}
                    </View>
                    <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                    <View style={styles.clubMeta}>
                      <MaterialIcons name="people" size={12} color={Colors.textMuted} />
                      <Text style={styles.clubMetaText}>{club.members_count} members</Text>
                      <View style={[styles.catPill, { backgroundColor: catColor + '18' }]}><Text style={[styles.catPillText, { color: catColor }]}>{club.category}</Text></View>
                    </View>
                  </View>
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); handleJoinToggle(club); }}
                    disabled={actionLoading === club.id || status === 'approved' || status === 'rejected'}
                    style={[
                      styles.joinBtn,
                      status === 'approved' ? { backgroundColor: Colors.success + '22', borderColor: Colors.success + '55' } :
                      status === 'pending' ? { backgroundColor: Colors.warning + '22', borderColor: Colors.warning + '55' } :
                      status === 'rejected' ? { backgroundColor: Colors.error + '22', borderColor: Colors.error + '22' } :
                      { backgroundColor: catColor + '18', borderColor: catColor + '55' }
                    ]}
                  >
                    {actionLoading === club.id ? <ActivityIndicator size="small" color={catColor} /> :
                      <Text style={[styles.joinBtnText, {
                        color: status === 'approved' ? Colors.success : status === 'pending' ? Colors.warning : status === 'rejected' ? Colors.error : catColor
                      }]}>{status === 'approved' ? 'Member' : status === 'pending' ? 'Pending' : status === 'rejected' ? 'Rejected' : 'Join'}</Text>}
                  </Pressable>
                </Pressable>
              );
            })}
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
  headerGreet: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  nustBadge: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  nustBadgeText: { color: Colors.textOnPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, letterSpacing: 1 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginHorizontal: Spacing.md, marginTop: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 12, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.body, padding: 0 },
  section: { marginTop: Spacing.md },
  sectionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: 8 },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, flex: 1 },
  countBadge: { color: Colors.textMuted, fontSize: FontSize.sm, backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill },
  catChip: { height: 36, paddingHorizontal: Spacing.md, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  catChipDefault: { backgroundColor: 'transparent', borderColor: Colors.surfaceBorder },
  catChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  featCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', width: 110, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: 4 },
  featIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  featLetter: { fontSize: 20, fontWeight: FontWeight.bold },
  featShort: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'center' },
  featMembers: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center' },
  featStatus: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  featStatusText: { fontSize: 10, fontWeight: FontWeight.semibold },
  clubCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  clubIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, flexShrink: 0 },
  clubLetter: { fontSize: 22, fontWeight: FontWeight.bold },
  clubInfo: { flex: 1 },
  clubTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clubShort: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  clubName: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  clubMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  clubMetaText: { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  catPill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  catPillText: { fontSize: 10, fontWeight: FontWeight.semibold },
  joinBtn: { borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, minWidth: 70, alignItems: 'center' },
  joinBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  inactiveBadge: { backgroundColor: Colors.error + '22', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  inactiveText: { color: Colors.error, fontSize: 10, fontWeight: FontWeight.semibold },
  empty: { alignItems: 'center', paddingVertical: 40, gap: Spacing.sm },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
});
