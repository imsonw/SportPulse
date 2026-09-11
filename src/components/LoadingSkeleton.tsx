import { StyleSheet, View } from 'react-native';
import { radius, useThemeColors } from '@/theme';

interface LoadingSkeletonProps {
  width?: number | `${number}%`;
  height?: number;
}

// Chưa có hiệu ứng shimmer/pulse — cần Animated hoặc Reanimated (worklet), khái niệm của Sprint 3,
// chưa dạy ở sprint này. Khối tĩnh màu surface tạm đủ để verify layout đang chờ dữ liệu.
export function LoadingSkeleton({ width = '100%', height = 16 }: LoadingSkeletonProps) {
  const colors = useThemeColors();

  return <View style={[styles.base, { width, height, backgroundColor: colors.surface }]} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
  },
});
