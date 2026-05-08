import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { useAuth } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORY_COLORS, type Club, type ClubUpdate, type ClubEvent } from '@/constants/data';
import { fetchClubById } from '@/services/clubs';
import { getClubUpdates } from '@/services/updates';
import { getClubEvents } from '@/services/events';
import { getMyMembershipForClub, requestToJoin, cancelRequest } from '@/services/memberships';
import { useProfile } from '@/hooks/useProfile';
import type { ClubMembership } from '@/constants/data';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [club, setClub] = useState<Club | null>(null);
  const [updates, setUpdates] = useState<ClubUpdate[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [membership, setMembership] = useState<ClubMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const [clubData, updatesData, eventsData, membershipData] = await Promise.all([
      fetchClubById(id),
      getClubUpdates(id),
      getClubEvents(id),
      getMyMembershipForClub(id, user.id),
    ]);
    setClub(clubData);
    setUpdates(updatesData);
    setEvents(eventsData);
    setMembership(membershipData);
    setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  const catColor = CATEGORY_COLORS[club?.category || ''] || Colors.primary;

  const handleJoinToggle = async () => {
    if (!user || !club) return;
    setActionLoading(true);
    if (!membership) {
      const { error } = await requestToJoin(club.id, user.id);
      if (error) { showAlert('Error', error); } else {
        showAlert('Request Sent', `Your request to join ${club.short_name} has been submitted!`);
        await load();
      }
    } else if (membership.status === 'pending') {
      showAlert('Withdraw Request', `Cancel your request to join ${club.short_name}?`, [
        { text: 'Keep', style: 'cancel' },
        { text: 'Withdraw', style: 'destructive', onPress: async () => { await cancelRequest(club.id, user.id); await load(); } },
      ]);
    }
    setActionLoading(false);
  };

  if (loading || !club) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtnOnly}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{club.short_name}</Text>
        <Pressable onPress={() => showAlert('Share', `Share link for ${club.name} copied!`)} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <MaterialIcons name="share" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: club.cover_color + '18', borderBottomColor: club.cover_color + '33' }]}>
          <View style={[styles.heroIcon, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '55' }]}>
            <Text style={[styles.heroLetter, { color: club.cover_color }]}>{club.icon_letter}</Text>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroShort}>{club.short_name}</Text>
              {club.is_featured && <View style={styles.featuredBadge}><MaterialIcons name="star" size={12} color={Colors.primary} /><Text style={styles.featuredText}>Featured</Text></View>}
              {!club.is_active && <View style={styles.inactiveBadge}><Text style={styles.inactiveText}>Inactive</Text></View>}
            </View>
            <Text style={styles.heroFull}>{club.name}</Text>
            <View style={[styles.catBadge, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
              <Text style={[styles.catText, { color: catColor }]}>{club.category}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'people' as const, value: `${club.members_count}`, label: 'Members', color: catColor },
            { icon: 'calendar-today' as const, value: club.founded, label: 'Founded', color: Colors.primary },
            { icon: 'event' as const, value: `${events.length}`, label: 'Events', color: Colors.info },
            { icon: 'campaign' as const, value: `${updates.length}`, label: 'Posts', color: Colors.success },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <MaterialIcons name={s.icon} size={16} color={s.color} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bodyText}>{club.long_description}</Text>
        </View>

        {/* Meeting Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Info</Text>
          <View style={styles.detailCard}>
            {[
              { icon: 'today' as const, label: 'Day', value: club.meeting_day },
              { icon: 'access-time' as const, label: 'Time', value: club.meeting_time },
              { icon: 'location-on' as const, label: 'Venue', value: club.location },
              { icon: 'email' as const, label: 'Email', value: club.email },
            ].map((row, i) => (
              <View key={row.label} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.surfaceBorder }]}>
                <MaterialIcons name={row.icon} size={16} color={Colors.textMuted} />
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Updates */}
        {updates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Updates</Text>
            {updates.slice(0, 3).map(u => (
              <View key={u.id} style={styles.updateCard}>
                <Text style={styles.updateTitle}>{u.title}</Text>
                <Text style={styles.updateContent} numberOfLines={3}>{u.content}</Text>
                <Text style={styles.updateDate}>{new Date(u.created_at).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Events */}
        {events.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {events.map(event => (
              <View key={event.id} style={styles.eventRow}>
                <View style={[styles.eventDot, { backgroundColor: catColor }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventMeta}>{event.date} • {event.time}</Text>
                  <Text style={styles.eventLoc}>{event.location}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA - only for students */}
      {profile?.role === 'student' && (
        <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Pressable
            onPress={handleJoinToggle}
            disabled={actionLoading || membership?.status === 'approved' || membership?.status === 'rejected'}
            style={({ pressed }) => [
              styles.cta,
              membership?.status === 'approved' ? styles.ctaApproved :
              membership?.status === 'pending' ? styles.ctaPending :
              membership?.status === 'rejected' ? styles.ctaRejected :
              [{ backgroundColor: catColor }],
              pressed && { opacity: 0.85 },
            ]}
          >
            {membership?.status === 'approved'
              ? <><MaterialIcons name="check" size={20} color={Colors.success} /><Text style={[styles.ctaText, { color: Colors.success }]}>You are a Member</Text></>
              : membership?.status === 'pending'
                ? <><MaterialIcons name="schedule" size={20} color={Colors.warning} /><Text style={[styles.ctaText, { color: Colors.warning }]}>Pending Approval — Tap to Withdraw</Text></>
                : membership?.status === 'rejected'
                  ? <Text style={[styles.ctaText, { color: Colors.error }]}>Request Rejected</Text>
                  : <Text style={[styles.ctaText, { color: Colors.textOnPrimary }]}>Join {club.short_name}</Text>
            }
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  backBtnOnly: { padding: Spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  backBtn: { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderBottomWidth: 1 },
  heroIcon: { width: 72, height: 72, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, flexShrink: 0 },
  heroLetter: { fontSize: 30, fontWeight: FontWeight.extrabold },
  heroMeta: { flex: 1, gap: 4 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  heroShort: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.primary + '18', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  featuredText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  inactiveBadge: { backgroundColor: Colors.error + '22', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  inactiveText: { color: Colors.error, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  heroFull: { color: Colors.textSecondary, fontSize: FontSize.sm },
  catBadge: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, marginTop: 4 },
  catText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 3 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.surfaceBorder },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  bodyText: { color: Colors.textSecondary, fontSize: FontSize.body, lineHeight: 24 },
  detailCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  detailLabel: { color: Colors.textMuted, fontSize: FontSize.sm, width: 50 },
  detailValue: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.medium, textAlign: 'right' },
  updateCard: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.surfaceBorder },
  updateTitle: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.semibold, marginBottom: 4 },
  updateContent: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 18 },
  updateDate: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 6 },
  eventRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  eventDot: { width: 3, borderRadius: 2, minHeight: 50 },
  eventContent: { flex: 1, backgroundColor: Colors.surfaceCard, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder },
  eventTitle: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.semibold },
  eventMeta: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 3 },
  eventLoc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.background, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.lg, paddingVertical: 16, gap: Spacing.sm },
  ctaApproved: { backgroundColor: Colors.success + '15', borderWidth: 1.5, borderColor: Colors.success + '44' },
  ctaPending: { backgroundColor: Colors.warning + '15', borderWidth: 1.5, borderColor: Colors.warning + '44' },
  ctaRejected: { backgroundColor: Colors.error + '15', borderWidth: 1.5, borderColor: Colors.error + '44' },
  ctaText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
