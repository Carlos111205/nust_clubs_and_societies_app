import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORIES, CATEGORY_COLORS, type Category, type ClubEvent } from '@/constants/data';
import { getAllEvents, registerForEvent, unregisterFromEvent, getMyEventRegistrations } from '@/services/events';

export default function StudentEventsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [myRegs, setMyRegs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Category | 'All'>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [eventsData, regs] = await Promise.all([getAllEvents(), getMyEventRegistrations(user.id)]);
    setEvents(eventsData);
    setMyRegs(regs);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleToggleRegister = async (event: ClubEvent) => {
    if (!user) return;
    const isReg = myRegs.includes(event.id);
    setActionLoading(event.id);
    if (isReg) {
      showAlert('Cancel Registration', `Remove yourself from "${event.title}"?`, [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: async () => { await unregisterFromEvent(event.id, user.id); await load(); } },
      ]);
    } else {
      const { error } = await registerForEvent(event.id, user.id);
      if (error) { showAlert('Error', error); } else { showAlert('Registered!', `You are registered for "${event.title}".`); await load(); }
    }
    setActionLoading(null);
  };

  const filtered = events.filter(e => selected === 'All' || e.club?.category === selected);

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Stay in the loop</Text>
          <Text style={styles.headerTitle}>Upcoming Events</Text>
        </View>
        <View style={styles.countWrap}>
          <Text style={styles.countNum}>{events.length}</Text>
          <Text style={styles.countLabel}>Events</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: Spacing.sm }}>
        {(['All', ...CATEGORIES.filter(c => c !== 'All')] as (Category | 'All')[]).map(cat => (
          <Pressable key={cat} onPress={() => setSelected(cat)} style={[styles.catChip, selected === cat ? { backgroundColor: CATEGORY_COLORS[cat] || Colors.primary, borderColor: CATEGORY_COLORS[cat] || Colors.primary } : styles.catChipDefault]}>
            <Text style={[styles.catChipText, selected === cat ? { color: Colors.textOnPrimary } : { color: CATEGORY_COLORS[cat] || Colors.primary }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />} contentContainerStyle={{ paddingTop: Spacing.sm }}>
        {filtered.length === 0
          ? <View style={styles.empty}><MaterialIcons name="event-busy" size={56} color={Colors.textMuted} /><Text style={styles.emptyTitle}>No Events</Text></View>
          : filtered.map(event => {
            const isReg = myRegs.includes(event.id);
            const catColor = CATEGORY_COLORS[event.club?.category || ''] || Colors.primary;
            return (
              <View key={event.id} style={styles.card}>
                <View style={[styles.dateBadge, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
                  <Text style={[styles.dateDay, { color: catColor }]}>{event.date.split(' ')[1]?.replace(',', '') || '—'}</Text>
                  <Text style={[styles.dateMonth, { color: catColor + 'BB' }]}>{event.date.split(' ')[0]?.slice(0, 3)}</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: 4 }}>
                    <View style={[styles.clubPill, { backgroundColor: catColor + '18' }]}><Text style={[styles.clubPillText, { color: catColor }]}>{event.club?.short_name || 'Club'}</Text></View>
                  </View>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{event.description}</Text>
                  <View style={styles.metaRow}>
                    <MaterialIcons name="access-time" size={12} color={Colors.textMuted} /><Text style={styles.metaText}>{event.time}</Text>
                    <MaterialIcons name="location-on" size={12} color={Colors.textMuted} /><Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleToggleRegister(event)}
                    disabled={actionLoading === event.id}
                    style={[styles.regBtn, isReg ? { backgroundColor: Colors.success + '18', borderColor: Colors.success + '44' } : { borderColor: catColor }]}
                  >
                    {actionLoading === event.id
                      ? <ActivityIndicator size="small" color={catColor} />
                      : isReg
                        ? <><MaterialIcons name="check-circle" size={14} color={Colors.success} /><Text style={[styles.regBtnText, { color: Colors.success }]}>Registered</Text></>
                        : <Text style={[styles.regBtnText, { color: catColor }]}>Register Now</Text>
                    }
                  </Pressable>
                </View>
              </View>
            );
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
  catChip: { height: 34, paddingHorizontal: Spacing.md, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  catChipDefault: { backgroundColor: 'transparent', borderColor: Colors.surfaceBorder },
  catChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  card: { flexDirection: 'row', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceBorder, overflow: 'hidden' },
  dateBadge: { width: 52, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, paddingVertical: Spacing.md },
  dateDay: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  dateMonth: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase' },
  cardContent: { flex: 1, padding: Spacing.md },
  clubPill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  clubPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  cardTitle: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold, marginBottom: 4 },
  cardDesc: { color: Colors.textMuted, fontSize: FontSize.sm, lineHeight: 18, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  metaText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginRight: 4 },
  regBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, paddingVertical: 9, gap: 5, borderWidth: 1.5 },
  regBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  empty: { alignItems: 'center', paddingVertical: 64, gap: Spacing.sm },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
});
