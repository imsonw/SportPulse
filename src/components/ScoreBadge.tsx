import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography, useThemeColors } from '@/theme';

interface ScoreBadgeProps {
  homeScore: number;
  awayScore: number;
  isLive?: boolean;
}

export function ScoreBadge({ homeScore, awayScore, isLive = false }: ScoreBadgeProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {isLive && (
        <View style={[styles.liveDot, { backgroundColor: colors.danger }]}>
          <Text style={[styles.liveText, { color: colors.onPrimary }]}>LIVE</Text>
        </View>
      )}
      <Text style={[styles.score, { color: colors.text }]}>
        {homeScore} - {awayScore}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveDot: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  liveText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  score: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
});
