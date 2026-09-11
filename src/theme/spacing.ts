// Thang đo cố định (scale) thay vì số tuỳ ý mỗi chỗ — cùng lý do với colors: đổi nhịp giãn cách
// toàn app chỉ sửa ở đây, và các component dùng chung 1 "ngôn ngữ" khoảng cách.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
