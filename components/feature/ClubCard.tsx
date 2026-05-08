import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { CATEGORY_COLORS, type Club } from '@/constants/data';

interface Props {
  club: Club;
}

export function ClubCard({ club }: Props) {
  const router = useRouter();
  const catColor = CATEGORY_COLORS[club.category] || Colors.primary;

  return (
    <Pressable
      onPress={() => router.push(`/club/${club.id}` as any)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      <View style={[styles.icon, { backgroundColor: club.cover_color + '22', borderColor: club.cover_color + '44' }]}>
        <Text style={[styles.letter, { color: club.cover_color }]}>{club.icon_letter}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.short}>{club.short_name}</Text>
          {club.is_featured && <MaterialIcons name="star" size={14} color={Colors.primary} />}
          {!club.is_active && <View style={styles.inactiveBadge}><Text style={styles.inactiveText}>Inactive</Text></View>}
        </View>
        <Text style={styles.name} numberOfLines={1}>{club.name}</Text>
        <View style={styles.meta}>
          <MaterialIcons name="people" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{club.members_count} members</Text>
          <View style={[styles.catPill, { backgroundColor: catColor + '18' }]}>
            <Text style={[styles.catPillText, { color: catColor }]}>{club.category}</Text>
          </View>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg, marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: Spacing.sm,
  },
  icon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, flexShrink: 0 },
  letter: { fontSize: 22, fontWeight: FontWeight.bold },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  short: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  name: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  metaText: { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  catPill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  catPillText: { fontSize: 10, fontWeight: FontWeight.semibold },
  inactiveBadge: { backgroundColor: Colors.error + '22', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  inactiveText: { color: Colors.error, fontSize: 10, fontWeight: FontWeight.semibold },
});
