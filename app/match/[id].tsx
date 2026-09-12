import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { ScoreBadge } from '@/components/ScoreBadge';
import { useMatchDetail } from '@/features/matches/hooks';
import { MatchEvent } from '@/features/matches/types';
import { spacing, useThemeColors } from '@/theme';

// Cùng pattern discriminated union đã học TASK-1: switch theo `type` để TypeScript tự narrow
// từng field riêng (scorer/player/newStatus) mà không cần optional chaining hay ép kiểu tay.
function describeEvent(event: MatchEvent): string {
  switch (event.type) {
    case 'GOAL':
      return `⚽ ${event.scorer} ghi bàn${event.assist ? ` (kiến tạo: ${event.assist})` : ''}`;
    case 'CARD':
      return `${event.cardColor === 'RED' ? '🟥' : '🟨'} ${event.player} nhận thẻ`;
    case 'STATUS_CHANGE':
      return `Trạng thái chuyển sang ${event.newStatus}`;
    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}

export default function MatchDetailScreen() {
  // id luôn là string (hoặc string[] nếu param lặp) vì nó đến từ URL, không phải object JS truyền tay
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  // Cùng queryKey với setQueryData sẽ thêm ở buổi sau (TASK-10 phần 2) — nên nếu feed đã
  // prefetch trước khi push, `isPending` ở đây sẽ là false ngay từ render đầu, không có màn loading.
  const { data: match, isPending, error } = useMatchDetail(id);

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.danger }]}>
          Không thể tải trận đấu: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.teamRow}>
        <View style={styles.teamCell}>
          <Avatar name={match.homeTeam.name} uri={match.homeTeam.logoUrl} size={36} />
          <Text style={[styles.teamName, { color: colors.text }]}>{match.homeTeam.name}</Text>
        </View>
        <ScoreBadge
          homeScore={match.homeScore}
          awayScore={match.awayScore}
          isLive={match.status === 'LIVE'}
        />
        <View style={styles.teamCell}>
          <Text style={[styles.teamName, { color: colors.text }]}>{match.awayTeam.name}</Text>
          <Avatar name={match.awayTeam.name} uri={match.awayTeam.logoUrl} size={36} />
        </View>
      </View>
      <FlashList
        data={match.events}
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <Text
              style={[styles.eventMinute, { color: colors.textMuted }]}
            >{`${item.minute}'`}</Text>
            <Text style={[styles.eventText, { color: colors.text }]}>{describeEvent(item)}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState title="Chưa có sự kiện" description="Trận đấu chưa bắt đầu" />
        }
        contentContainerStyle={styles.listPadding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
  },
  listPadding: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  eventMinute: {
    fontSize: 14,
    fontWeight: '700',
    width: 36,
  },
  eventText: {
    fontSize: 14,
    flex: 1,
  },
});
