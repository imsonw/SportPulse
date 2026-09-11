import { Image, StyleSheet, Text, View } from 'react-native';
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
    return <Image source={{ uri }} style={dimensionStyle} />;
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
