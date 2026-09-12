import { useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ScoreBadge } from '@/components/ScoreBadge';
import { matchKeys, useMatches } from '@/features/matches/hooks';
import { Match } from '@/features/matches/types';
import { wsClient } from '@/lib/ws-client';
import { spacing, typography, useThemeColors } from '@/theme';

export default function LiveScreen() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const { data: matches, isPending, isRefetching, refetch, error } = useMatches();

  // WHY: gán thẳng `item` (đã đủ dữ liệu, lấy từ cache list) vào cache detail TRƯỚC khi push.
  // Không gọi prefetchQuery/fetch lại vì item đã là dữ liệu đầy đủ — không có network nào để chờ,
  // nên match/[id] mount lên là isPending=false ngay, không có khoảng loading nào cả.
  const handlePressMatch = (item: Match) => {
    queryClient.setQueryData(matchKeys.detail(item.id), item);
    router.push(`/match/${item.id}`);
  };

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
    <Pressable style={styles.cardWrapper} onPress={() => handlePressMatch(item)}>
      <Card style={styles.cardContent}>
        <View style={styles.teamRow}>
          <View style={styles.teamCell}>
            <Avatar name={item.homeTeam.name} uri={item.homeTeam.logoUrl} size={28} />
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
              {item.homeTeam.name}
            </Text>
          </View>
          <ScoreBadge
            homeScore={item.homeScore}
            awayScore={item.awayScore}
            isLive={item.status === 'LIVE'}
          />
          <View style={[styles.teamCell, styles.teamCellReversed]}>
            <Text
              style={[styles.teamName, { color: colors.text, textAlign: 'right' }]}
              numberOfLines={1}
            >
              {item.awayTeam.name}
            </Text>
            <Avatar name={item.awayTeam.name} uri={item.awayTeam.logoUrl} size={28} />
          </View>
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
      {/* TEST TẠM THỜI — bắn event WS giả để verify setQueryData, xoá sau khi kiểm chứng */}
      <Pressable
        style={styles.testButton}
        onPress={() =>
          wsClient.emitMockEvent({
            id: `test-${Date.now()}`,
            matchId: 'm1',
            minute: 70,
            type: 'GOAL',
            teamId: 't1',
            scorer: 'TEST',
          })
        }
      >
        <Text style={styles.testButtonText}>[TEST] Bắn GOAL cho m1/t1 (Arsenal)</Text>
      </Pressable>
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
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  teamCellReversed: {
    justifyContent: 'flex-end',
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
  // TEST TẠM THỜI — xoá cùng lúc với nút ở trên
  testButton: {
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  testButtonText: {
    color: 'orange',
    textAlign: 'center',
  },
});
