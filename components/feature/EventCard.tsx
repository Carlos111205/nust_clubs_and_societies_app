import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useAlert } from '@/template';
import type { ClubEvent } from '@/constants/data';

interface Props {
  event: ClubEvent & {
    isRegistered?: boolean;
    clubName?: string;
    attendees?: number;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Academic: Colors.academic,
  Sports: Colors.sports,
  Arts: Colors.arts,
  Tech: Colors.tech,
  Cultural: Colors.cultural,
  Social: Colors.social,
};

export function EventCard({ event }: Props) {
  const { showAlert } = useAlert();
  const [registered, setRegistered] = useState(event.isRegistered);
  const category = event.club?.category || 'Social';
  const catColor = CATEGORY_COLORS[category] || Colors.primary;

  const handleRegister = () => {
    if (registered) {
      showAlert(
        'Cancel Registration',
        `Remove yourself from "${event.title}"?`,
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Cancel Registration',
            style: 'destructive',
            onPress: () => setRegistered(false),
          },
        ]
      );
    } else {
      setRegistered(true);
      showAlert('Registered!', `You have registered for "${event.title}". See you there!`);
    }
  };

  return (
    <View style={styles.card}>
      {/* Date strip */}
      <View style={[styles.dateBadge, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
        <Text style={[styles.dateText, { color: catColor }]}>{event.date.split(',')[0].split(' ')[1]}</Text>
        <Text style={[styles.monthText, { color: catColor + 'BB' }]}>{event.date.split(' ')[0]}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={[styles.clubBadge, { backgroundColor: catColor + '18' }]}>
            <Text style={[styles.clubBadgeText, { color: catColor }]}>{event.clubName}</Text>
          </View>
          <View style={[styles.catBadge, { borderColor: catColor + '33' }]}>
            <Text style={[styles.catBadgeText, { color: catColor }]}>{category}</Text>
          </View>
        </View>

        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{event.description}</Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="access-time" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{event.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="location-on" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="people" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{event.attendees} attending</Text>
          </View>
        </View>

        <Pressable
          onPress={handleRegister}
          style={({ pressed }) => [
            styles.registerBtn,
            registered ? styles.registeredBtn : [styles.unregisteredBtn, { borderColor: catColor }],
            pressed && { opacity: 0.75 },
          ]}
        >
          {registered ? (
            <>
              <MaterialIcons name="check-circle" size={15} color={Colors.success} />
              <Text style={[styles.btnText, { color: Colors.success }]}>Registered</Text>
            </>
          ) : (
            <Text style={[styles.btnText, { color: catColor }]}>Register Now</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  dateBadge: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    paddingVertical: Spacing.md,
  },
  dateText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    lineHeight: 24,
  },
  monthText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  clubBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  clubBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  catBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  catBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  description: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  meta: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    flex: 1,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: 9,
    gap: 5,
    borderWidth: 1.5,
  },
  registeredBtn: {
    backgroundColor: Colors.success + '15',
    borderColor: Colors.success + '44',
  },
  unregisteredBtn: {
    backgroundColor: 'transparent',
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
