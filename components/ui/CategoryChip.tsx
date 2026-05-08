import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import type { Category } from '@/constants/data';

const CATEGORY_COLORS: Record<string, string> = {
  Academic: Colors.academic,
  Sports: Colors.sports,
  Arts: Colors.arts,
  Tech: Colors.tech,
  Cultural: Colors.cultural,
  Social: Colors.social,
  All: Colors.primary,
};

interface Props {
  label: Category;
  isSelected: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, isSelected, onPress }: Props) {
  const accentColor = CATEGORY_COLORS[label] || Colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isSelected ? { backgroundColor: accentColor, borderColor: accentColor } : styles.chipDefault,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, isSelected ? styles.labelSelected : { color: accentColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1.5,
  },
  chipDefault: {
    backgroundColor: 'transparent',
    borderColor: Colors.surfaceBorder,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  labelSelected: {
    color: Colors.textOnPrimary,
  },
});
