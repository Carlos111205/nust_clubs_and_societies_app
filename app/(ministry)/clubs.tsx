import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORIES, CATEGORY_COLORS, type Category, type Club } from '@/constants/data';
import { fetchClubs } from '@/services/clubs';

export default function MinistryClubsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Category | 'All'>('All');

  const load = useCallback(async () => {
    const data = await fetchClubs();
    setClubs(data); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = clubs.filter(c => {
    const matchCat = selected === 'All' || c.category === selected;
    const matchQ = !query.trim() || c.name.toLowerCase().includes(query.toLowerCase()) || c.short_name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Ministry view</Text>
          <Text style={styles.headerTitle}>All Clubs ({clubs.length})</Text>
        </View>
        <View style={styles.statsSummary}>
          <Text style={[styles.activeCount, { color: Colors.success }]}>{clubs.filter(c => c.is_active).length} active</Text>
          <Text style={styles.inactiveCount}>{clubs.filter(c => !c.is_active).length} inactive</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search clubs..." placeholderTextColor={Colors.textMuted} style={styles.searchInput} />
        {query.length > 0 && <Pressable onPress={() => setQuery('')}><MaterialIcons name="close" size={18} color={Colors.textMuted} /></Pressable>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: Spacing.sm }}>
        {CATEGORIES.map(cat => (
          <Pressable key={cat} onPress={() => setSelected(cat)} style={[styles.catChip, selected === cat ? { backgroundColor: CATEGORY_COLORS[cat] || Colors.primary, borderColor: CATEGORY_COLORS[cat] || Colors.primary } : styles.catChipDefault]}>
            <Text style={[styles.catChipText, selected === cat ? { color: Colors.textOnPrimary } : { color: CATEGORY_COLORS[cat] || Colors.primary }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />} contentContainerStyle={{ padding: Spacing.md }}>
        {filtered.map(club => {
          const catColor = CATEGORY_COLORS[club.category] || Colors.primary;
          return (
            <Pressable key={club.id} onPress={() => router.push(`/club/${club.id}` as any)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
              <View style={[styles.cardIcon, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '44' }]}>
                <Text style={[styles.cardLetter, { color: club.cover_color }]}>{club.icon_letter}</Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardShort}>{club.short_name}</Text>
                  {club.is_featured && <MaterialIcons name="star" size={14} color={Colors.primary} />}
                </View>
                <Text style={styles.cardName} numberOfLines={1}>{club.name}</Text>
                <View style={styles.cardMeta}>
                  <View style={[styles.catPill, { backgroundColor: catColor + '18' }]}><Text style={[styles.catPillText, { color: catColor }]}>{club.category}</Text></View>
                  <MaterialIcons name="people" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{club.members_count}</Text>
                  <Text style={styles.metaText}>• Est. {club.founded}</Text>
                </View>
              </View>
              <View style={[styles.statusDot, { backgroundColor: club.is_active ? Colors.success : Colors.error }]} />
            </Pressable>
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
  statsSummary: { alignItems: 'flex-end' },
  activeCount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  inactiveCount: { color: Colors.textMuted, fontSize: FontSize.xs },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, margin: Spacing.md, marginBottom: 0, paddingHorizontal: Spacing.md, paddingVertical: 12, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.body, padding: 0 },
  catChip: { height: 34, paddingHorizontal: Spacing.md, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  catChipDefault: { backgroundColor: 'transparent', borderColor: Colors.surfaceBorder },
  catChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm },
  cardIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, flexShrink: 0 },
  cardLetter: { fontSize: 22, fontWeight: FontWeight.bold },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardShort: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  cardName: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  catPill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  catPillText: { fontSize: 10, fontWeight: FontWeight.semibold },
  metaText: { color: Colors.textMuted, fontSize: FontSize.xs },
  statusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
});
