import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing, typography, useThemeColors } from '@/theme';

type ButtonVariant = 'primary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const colors = useThemeColors();
  // loading gộp vào disabled — bấm nút trong lúc đang loading không nên gọi lại onPress lần nữa
  const isDisabled = disabled || loading;
  const textColor = variant === 'primary' ? colors.onPrimary : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      // Style phụ thuộc theme (màu) không đặt được trong StyleSheet.create tĩnh — StyleSheet.create
      // chạy 1 lần lúc module load, còn colors đến từ hook (đổi theo dark mode lúc runtime).
      // Layout tĩnh (radius, spacing) vẫn ở StyleSheet.create, chỉ màu ghép thêm bằng mảng style.
      style={({ pressed }) => [
        styles.base,
        variant === 'primary'
          ? { backgroundColor: colors.primary }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
