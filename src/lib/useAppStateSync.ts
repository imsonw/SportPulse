 import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { wsClient } from './ws-client';

// Đồng bộ vòng đời kết nối WS theo vòng đời app — tương đương
// applicationDidEnterBackground/WillEnterForeground bên native iOS.
export function useAppStateSync() {
  useEffect(() => {
    wsClient.connect();

    const handleChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        wsClient.connect(); // an toàn gọi lặp lại — connect() đã tự guard nếu đang OPEN/CONNECTING
      } else if (nextState === 'background') {
        wsClient.disconnect();
      }
      // 'inactive' CỐ Ý bỏ qua — trạng thái chuyển tiếp rất ngắn (vd. kéo Control Center trên iOS),
      // disconnect ở đây chỉ gây reconnect thừa, không có lợi ích thật (đúng bẫy đã học ở gate)
    };

    const subscription = AppState.addEventListener('change', handleChange);

    return () => {
      subscription.remove();
      wsClient.disconnect();
    };
  }, []);
}
