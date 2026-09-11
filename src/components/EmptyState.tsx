import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography, useThemeColors } from '@/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.size.sm,
    textAlign: 'center',
  },
});
