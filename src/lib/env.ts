import Constants from 'expo-constants';

// extra chỉ chứa CẤU HÌNH CÔNG KHAI (domain, không phải secret) — đúng bài học buổi này.
// Không có API key/token bí mật nào được phép nằm ở đây, vì nó bị đóng gói thẳng vào bundle.
interface AppConfigExtra {
  apiUrl?: string;
  wsUrl?: string;
}

function readExtra(key: keyof AppConfigExtra): string {
  const extra = Constants.expoConfig?.extra as AppConfigExtra | undefined;
  const value = extra?.[key];

  // Validate ngay lúc module này được import (tức lúc app khởi động), không để tới lúc gọi fetch()
  // mới lộ ra "undefined" mơ hồ — đúng bẫy đã học ở gate.
  if (!value) {
    throw new Error(
      `[env] Thiếu cấu hình "${key}" trong app.json > expo.extra. Kiểm tra lại trước khi build.`,
    );
  }

  return value;
}

export const API_URL = readExtra('apiUrl');
export const WS_URL = readExtra('wsUrl');
