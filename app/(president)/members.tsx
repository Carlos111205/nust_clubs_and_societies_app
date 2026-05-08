import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { type ClubMembership } from '@/constants/data';
import { getClubMembers } from '@/services/memberships';
import { fetchClubByPresidentId } from '@/services/clubs';

export default function PresidentMembersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [members, setMembers] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const club = await fetchClubByPresidentId(user.id);
    if (club) { const data = await getClubMembers(club.id); setMembers(data); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = members.filter(m => {
    if (!query.trim()) return true;
    const u = m.user;
    return u?.full_name?.toLowerCase().includes(query.toLowerCase()) || u?.email?.toLowerCase().includes(query.toLowerCase()) || u?.student_id?.toLowerCase().includes(query.toLowerCase());
  });

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>All approved members</Text>
          <Text style={styles.headerTitle}>Members ({members.length})</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search members..." placeholderTextColor={Colors.textMuted} style={styles.searchInput} />
        {query.length > 0 && <Pressable onPress={() => setQuery('')}><MaterialIcons name="close" size={18} color={Colors.textMuted} /></Pressable>}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />} contentContainerStyle={{ padding: Spacing.md }}>
        {filtered.length === 0
          ? <View style={styles.empty}>
            <MaterialIcons name="group" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{query ? 'No Results' : 'No Members Yet'}</Text>
          </View>
          : filtered.map((m, i) => {
            const u = m.user;
            const initials = u?.full_name ? u.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
            return (
              <View key={m.id} style={styles.card}>
                <Text style={styles.index}>{i + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: (u as any)?.avatar_color || Colors.primary }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{u?.full_name || 'Student'}</Text>
                  <Text style={styles.email}>{u?.email}</Text>
                  {u?.student_id ? <Text style={styles.sid}>ID: {u.student_id}</Text> : null}
                </View>
                <View>
                  <Text style={styles.joinedDate}>{m.reviewed_at ? new Date(m.reviewed_at).toLocaleDateString() : '—'}</Text>
                  <Text style={styles.joinedLabel}>Joined</Text>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, margin: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 12, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.body, padding: 0 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  index: { color: Colors.textMuted, fontSize: FontSize.xs, width: 20, textAlign: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: Colors.textOnPrimary, fontSize: FontSize.body, fontWeight: FontWeight.extrabold },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  email: { color: Colors.textMuted, fontSize: FontSize.xs },
  sid: { color: Colors.textMuted, fontSize: FontSize.xs },
  joinedDate: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textAlign: 'right' },
  joinedLabel: { color: Colors.textMuted, fontSize: 10, textAlign: 'right' },
  empty: { alignItems: 'center', paddingVertical: 64, gap: Spacing.sm },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
});
