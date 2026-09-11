import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ScoreBadge } from '@/components/ScoreBadge';
import { useMatches } from '@/features/matches/hooks';
import { Match } from '@/features/matches/types';
import { spacing, typography, useThemeColors } from '@/theme';

export default function LiveScreen() {
  const colors = useThemeColors();
  const { data: matches, isPending, isRefetching, refetch, error } = useMatches();

  // WHY: Chỉ render LoadingSkeleton khi isPending (lần đầu tiên mở màn hình, CHƯA CÓ dữ liệu trong cache).
  // Tuyệt đối không dùng isFetching ở đây vì khi user Pull-to-refresh hoặc refetch ngầm ở background,
  // ta muốn giữ nguyên dữ liệu cũ trên UI chứ không biến màn hình thành Skeleton chớp giật.
  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trực tiếp</Text>
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trực tiếp</Text>
        <Text style={[styles.errorText, { color: colors.danger }]}>
          Không thể tải danh sách trận đấu: {error.message}
        </Text>
      </View>
    );
  }

  const renderMatchItem = ({ item }: { item: Match }) => (
    <Pressable style={styles.cardWrapper} onPress={() => router.push(`/match/${item.id}`)}>
      <Card style={styles.cardContent}>
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, { color: colors.text }]}>{item.homeTeam.name}</Text>
          <ScoreBadge
            homeScore={item.homeScore}
            awayScore={item.awayScore}
            isLive={item.status === 'LIVE'}
          />
          <Text style={[styles.teamName, { color: colors.text, textAlign: 'right' }]}>
            {item.awayTeam.name}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: colors.textMuted }]}>
            {item.status === 'LIVE'
              ? `Phút ${item.minute}'`
              : item.status === 'FINISHED'
                ? 'Kết thúc'
                : 'Sắp diễn ra'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Trực tiếp</Text>
      <FlashList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        // WHY: refreshing={isRefetching} và onRefresh={refetch} giúp gắn đúng cờ Pull-to-refresh
        // của hệ thống Native (iOS RefreshControl), giữ UI mượt mà không bị Skeleton đè lên.
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <EmptyState
            title="Chưa có trận đấu nào"
            description="Hiện tại không có trận đấu nào đang diễn ra"
          />
        }
        contentContainerStyle={styles.listPadding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
  },
  listPadding: {
    paddingBottom: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    gap: spacing.xs,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamName: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  statusRow: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusText: {
    fontSize: typography.size.sm,
  },
  errorText: {
    fontSize: typography.size.md,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
