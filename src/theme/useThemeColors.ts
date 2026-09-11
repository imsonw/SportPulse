import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './colors';

// useColorScheme() trả về 'light' | 'dark' | null (null khi hệ điều hành chưa xác định được, hay
// gặp ở thời điểm rất sớm lúc khởi động) — fallback về 'light' để không quên nhánh null như bẫy đã học.
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}
