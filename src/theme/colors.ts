// Interface tường minh (không dùng `as const` + typeof, vì as const narrow từng giá trị thành
// literal type riêng của light, khiến darkColors không gán được — đã tự vấp lỗi này khi viết).
// Tên theo VAI TRÒ (background, border, primary...), không theo giá trị (blue500, gray200...) —
// đổi màu chủ đạo sau này chỉ sửa giá trị ở đây, không phải đổi tên biến ở mọi nơi dùng.
export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f2f2f2',
  text: '#111111',
  textMuted: '#666666',
  border: '#cccccc',
  primary: '#2563eb',
  onPrimary: '#ffffff',
  danger: '#dc2626',
};

// Khai kiểu tường minh ThemeColors — thiếu/thừa 1 key ở dark sẽ báo lỗi type ngay lúc code,
// không phải lỗi runtime khi user bật dark mode mới phát hiện thiếu màu.
export const darkColors: ThemeColors = {
  background: '#111111',
  surface: '#1c1c1e',
  text: '#f5f5f5',
  textMuted: '#a1a1aa',
  border: '#3a3a3c',
  primary: '#3b82f6',
  onPrimary: '#ffffff',
  danger: '#ef4444',
};
