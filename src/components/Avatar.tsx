import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { typography, useThemeColors } from '@/theme';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
}

export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  const colors = useThemeColors();
  const initial = name.trim().charAt(0).toUpperCase();
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    // contentFit="cover": logo đội thường không vuông tuyệt đối, "cover" lấp đầy khung tròn
    // (cắt bớt phần thừa) thay vì "contain" để trống viền, đúng bẫy #2 vừa học.
    // width/height cố định qua dimensionStyle (không phụ thuộc container) là điều kiện BẮT BUỘC
    // để expo-image downsample đúng — thiếu nó thì mất hết lợi ích so với Image gốc (bẫy #1).
    return <Image source={{ uri }} style={dimensionStyle} contentFit="cover" />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle, { backgroundColor: colors.primary }]}>
      <Text style={[styles.initial, { color: colors.onPrimary, fontSize: size / 2 }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: typography.weight.bold,
  },
});
