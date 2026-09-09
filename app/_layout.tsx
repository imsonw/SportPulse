import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    // 1. GestureHandlerRootView phải bọc ở ngoài cùng với { flex: 1 }
    // để bắt được toàn bộ cử chỉ vuốt chạm (swipe, drag) trên toàn app
    <GestureHandlerRootView style={styles.container}>
      {/* 2. SafeAreaProvider cung cấp toạ độ vùng an toàn (notch, status bar, dynamic island)
          cho mọi màn hình và navigator bên trong */}
      <SafeAreaProvider>
        {/* Placeholder: Vị trí của ThemeProvider / AuthProvider / QueryClientProvider 
            sẽ được bổ sung ở các task tiếp theo (TASK-20 cho Theme) */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Ẩn header cho recap: tab bar tự động không có vì route này nằm ngoài (tabs) —
              không cần cấu hình gì thêm cho việc đó */}
          <Stack.Screen name="recap/[matchId]" options={{ headerShown: false }} />
          {/* presentation: 'modal' (không phải fullScreenModal) — cho vuốt xuống đóng mặc định,
              đúng yêu cầu acceptance criteria F-002. Chưa chặn vuốt xuống lúc đang làm quiz dở,
              việc đó thuộc Sprint 3 */}
          <Stack.Screen name="modal/quiz-room" options={{ presentation: 'modal', title: 'Phòng chờ Quiz' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
