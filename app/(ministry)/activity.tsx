import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { type ClubUpdate, type ClubEvent } from '@/constants/data';
import { getAllUpdates } from '@/services/updates';
import { getAllEvents } from '@/services/events';

type FeedItem = { type: 'update'; data: ClubUpdate; date: string } | { type: 'event'; data: ClubEvent; date: string };

export default function MinistryActivityScreen() {
  const insets = useSafeAreaInsets();
  const [updates, setUpdates] = useState<ClubUpdate[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'updates' | 'events'>('all');

  const load = useCallback(async () => {
    const [u, e] = await Promise.all([getAllUpdates(), getAllEvents()]);
    setUpdates(u); setEvents(e); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const feed: FeedItem[] = [
    ...( filter !== 'events' ? updates.map(u => ({ type: 'update' as const, data: u, date: u.created_at })) : []),
    ...( filter !== 'updates' ? events.map(e => ({ type: 'event' as const, data: e, date: e.created_at })) : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>All clubs activity</Text>
          <Text style={styles.headerTitle}>Activity Feed</Text>
        </View>
        <View style={styles.countWrap}>
          <Text style={styles.countNum}>{feed.length}</Text>
          <Text style={styles.countLabel}>Items</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'updates', 'events'] as const).map(f => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <MaterialIcons
              name={f === 'all' ? 'dynamic-feed' : f === 'updates' ? 'campaign' : 'event'}
              size={14}
              color={filter === f ? Colors.textOnPrimary : Colors.textMuted}
            />
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'all' ? 'All' : f === 'updates' ? 'Posts' : 'Events'}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />} contentContainerStyle={{ padding: Spacing.md }}>
        {feed.length === 0
          ? <View style={styles.empty}><MaterialIcons name="dynamic-feed" size={64} color={Colors.textMuted} /><Text style={styles.emptyTitle}>No Activity Yet</Text></View>
          : feed.map((item, idx) => {
            if (item.type === 'update') {
              const u = item.data;
              return (
                <View key={`u-${u.id}`} style={styles.card}>
                  <View style={[styles.typeBadge, { backgroundColor: Colors.info + '22' }]}>
                    <MaterialIcons name="campaign" size={14} color={Colors.info} />
                    <Text style={[styles.typeText, { color: Colors.info }]}>Post</Text>
                  </View>
                  <View style={styles.cardHeader}>
                    <View style={[styles.clubDot, { backgroundColor: u.club?.cover_color || Colors.primary }]} />
                    <Text style={[styles.clubName, { color: u.club?.cover_color || Colors.primary }]}>{u.club?.short_name || 'Club'}</Text>
                    <Text style={styles.cardDate}>{new Date(u.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{u.title}</Text>
                  <Text style={styles.cardContent} numberOfLines={3}>{u.content}</Text>
                  {u.author && <Text style={styles.cardAuthor}>by {(u.author as any)?.full_name || u.author.email}</Text>}
                </View>
              );
            } else {
              const e = item.data;
              const catColor = e.club?.cover_color || Colors.primary;
              return (
                <View key={`e-${e.id}`} style={styles.card}>
                  <View style={[styles.typeBadge, { backgroundColor: Colors.success + '22' }]}>
                    <MaterialIcons name="event" size={14} color={Colors.success} />
                    <Text style={[styles.typeText, { color: Colors.success }]}>Event</Text>
                  </View>
                  <View style={styles.cardHeader}>
                    <View style={[styles.clubDot, { backgroundColor: catColor }]} />
                    <Text style={[styles.clubName, { color: catColor }]}>{e.club?.short_name || 'Club'}</Text>
                    <Text style={styles.cardDate}>{e.date}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{e.title}</Text>
                  <View style={styles.eventMeta}>
                    <MaterialIcons name="access-time" size={12} color={Colors.textMuted} />
                    <Text style={styles.eventMetaText}>{e.time}</Text>
                    <MaterialIcons name="location-on" size={12} color={Colors.textMuted} />
                    <Text style={styles.eventMetaText}>{e.location}</Text>
                  </View>
                </View>
              );
            }
          })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  countWrap: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', minWidth: 52, borderWidth: 1, borderColor: Colors.surfaceBorder },
  countNum: { color: Colors.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  countLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  filterChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.surfaceCard, borderWidth: 1.5, borderColor: Colors.surfaceBorder },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  filterTextActive: { color: Colors.textOnPrimary },
  card: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: 6 },
  typeBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  typeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clubDot: { width: 8, height: 8, borderRadius: 4 },
  clubName: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  cardDate: { color: Colors.textMuted, fontSize: FontSize.xs },
  cardTitle: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  cardContent: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 18 },
  cardAuthor: { color: Colors.textMuted, fontSize: FontSize.xs },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginRight: 4 },
  empty: { alignItems: 'center', paddingVertical: 64, gap: Spacing.sm },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
});
