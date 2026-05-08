import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string | number;
  color?: string;
}

export function StatBadge({ icon, value, color = Colors.primary }: Props) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={13} color={color} />
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  value: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
