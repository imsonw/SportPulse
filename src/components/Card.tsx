import { StyleSheet, View, type ViewProps } from 'react-native';
import { radius, spacing, useThemeColors } from '@/theme';

type CardProps = ViewProps;

export function Card({ style, children, ...rest }: CardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[styles.base, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
});
