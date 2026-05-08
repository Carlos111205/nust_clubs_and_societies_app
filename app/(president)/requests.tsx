import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { type ClubMembership } from '@/constants/data';
import { getPendingRequests, reviewMembership, getClubMembers } from '@/services/memberships';
import { fetchClubByPresidentId, updateClubMembersCount } from '@/services/clubs';

export default function PresidentRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [clubId, setClubId] = useState<string | null>(null);
  const [pending, setPending] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [members, setMembers] = useState<ClubMembership[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const club = await fetchClubByPresidentId(user.id);
    if (club) {
      setClubId(club.id);
      const [pendingData, membersData] = await Promise.all([getPendingRequests(club.id), getClubMembers(club.id)]);
      setPending(pendingData);
      setMembers(membersData);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleReview = async (membership: ClubMembership, status: 'approved' | 'rejected') => {
    if (!user || !clubId) return;
    setActionLoading(membership.id);
    const { error } = await reviewMembership(membership.id, status, user.id);
    if (error) { showAlert('Error', error); } else {
      await updateClubMembersCount(clubId);
      showAlert(status === 'approved' ? 'Approved!' : 'Rejected', `${membership.user?.full_name || 'User'} has been ${status}.`);
      await load();
    }
    setActionLoading(null);
  };

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const list = tab === 'pending' ? pending : members;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Manage membership</Text>
          <Text style={styles.headerTitle}>Join Requests</Text>
        </View>
        {pending.length > 0 && <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>{pending.length}</Text></View>}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable onPress={() => setTab('pending')} style={[styles.tab, tab === 'pending' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>Pending ({pending.length})</Text>
        </Pressable>
        <Pressable onPress={() => setTab('approved')} style={[styles.tab, tab === 'approved' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'approved' && styles.tabTextActive]}>Members ({members.length})</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />} contentContainerStyle={{ padding: Spacing.md }}>
        {list.length === 0
          ? <View style={styles.empty}>
            <MaterialIcons name={tab === 'pending' ? 'how-to-reg' : 'group'} size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{tab === 'pending' ? 'No Pending Requests' : 'No Members Yet'}</Text>
            <Text style={styles.emptySub}>{tab === 'pending' ? 'All requests have been reviewed.' : 'Approve requests to add members.'}</Text>
          </View>
          : list.map(m => {
            const user_profile = m.user;
            const initials = user_profile?.full_name ? user_profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
            return (
              <View key={m.id} style={styles.card}>
                <View style={[styles.avatar, { backgroundColor: (user_profile as any)?.avatar_color || Colors.primary }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{user_profile?.full_name || 'Student'}</Text>
                  <Text style={styles.cardEmail}>{user_profile?.email}</Text>
                  {user_profile?.student_id ? <Text style={styles.cardId}>ID: {user_profile.student_id}</Text> : null}
                  <Text style={styles.cardDate}>Requested {new Date(m.requested_at).toLocaleDateString()}</Text>
                </View>
                {tab === 'pending' && (
                  <View style={styles.actionBtns}>
                    <Pressable
                      onPress={() => handleReview(m, 'approved')}
                      disabled={actionLoading === m.id}
                      style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.8 }]}
                    >
                      {actionLoading === m.id ? <ActivityIndicator size="small" color={Colors.textOnPrimary} /> : <MaterialIcons name="check" size={18} color={Colors.textOnPrimary} />}
                    </Pressable>
                    <Pressable
                      onPress={() => handleReview(m, 'rejected')}
                      disabled={actionLoading === m.id}
                      style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.8 }]}
                    >
                      <MaterialIcons name="close" size={18} color={Colors.error} />
                    </Pressable>
                  </View>
                )}
                {tab === 'approved' && (
                  <View style={styles.memberBadge}>
                    <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                    <Text style={styles.memberText}>Member</Text>
                  </View>
                )}
              </View>
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
  pendingBadge: { backgroundColor: Colors.warning, borderRadius: Radius.pill, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  pendingBadgeText: { color: Colors.textOnPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.extrabold },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: FontSize.body, fontWeight: FontWeight.semibold },
  tabTextActive: { color: Colors.primary },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: Colors.textOnPrimary, fontSize: FontSize.body, fontWeight: FontWeight.extrabold },
  cardInfo: { flex: 1 },
  cardName: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  cardEmail: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  cardId: { color: Colors.textMuted, fontSize: FontSize.xs },
  cardDate: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  actionBtns: { flexDirection: 'row', gap: Spacing.xs },
  approveBtn: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.error + '22', borderWidth: 1.5, borderColor: Colors.error + '55', alignItems: 'center', justifyContent: 'center' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '18', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  memberText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  empty: { alignItems: 'center', paddingVertical: 64, gap: Spacing.sm },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
  emptySub: { color: Colors.textMuted, fontSize: FontSize.body, textAlign: 'center' },
});
