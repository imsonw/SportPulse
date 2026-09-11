import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStateSync } from '@/lib/useAppStateSync';

// Khởi tạo QueryClient KHỎI bộ nhớ React Component.
// WHY: Đảm bảo singleton instance tồn tại xuyên suốt vòng đời ứng dụng,
// không bị reset/mất cache mỗi khi RootLayout re-render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 30s — Trong 30s kể từ khi fetch, dữ liệu được coi là "Fresh" và useQuery
      // sẽ đọc trực tiếp từ cache mà không bắn thêm request ngầm.
      staleTime: 1000 * 30,
      // retry: 2 — Tự động thử lại 2 lần nếu request fail trước khi ném ra error cho UI.
      retry: 2,
    },
  },
});

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// STUB — luôn trả về đã đăng nhập trong sprint này. Auth thật (SecureStore, 3 trạng thái thay đổi
// theo thời gian) làm ở Sprint 4 / F-016. Giữ type 3 nhánh ngay từ đầu để guard bên dưới không phải
// sửa lại cấu trúc khi thay stub bằng hook thật — chỉ thay nội dung hàm này.
function useAuthStub(): { status: AuthStatus } {
  return { status: 'authenticated' };
}

export default function RootLayout() {
  const { status } = useAuthStub();
  // Luôn chạy bất kể status (rule of hooks: không được gọi hook có điều kiện, phải đặt trước mọi
  // early return). Nghĩa là WS mở cả khi status='unauthenticated' — chưa gate theo auth ở sprint
  // này (stub luôn trả 'authenticated' nên chưa lộ vấn đề); gate thật sự để dành Sprint 4/F-016.
  useAppStateSync();

  // loading: render null, KHÔNG render <Stack> — tránh đúng lỗi nháy màn hình đã học ở gate.
  // unauthenticated: <Redirect> ngay trong lượt render này, không phải useEffect + router.push.
  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  return (
    // 1. GestureHandlerRootView phải bọc ở ngoài cùng với { flex: 1 }
    // để bắt được toàn bộ cử chỉ vuốt chạm (swipe, drag) trên toàn app
    <GestureHandlerRootView style={styles.container}>
      {/* 2. SafeAreaProvider cung cấp toạ độ vùng an toàn (notch, status bar, dynamic island)
          cho mọi màn hình và navigator bên trong */}
      <SafeAreaProvider>
        {/* 3. QueryClientProvider cung cấp bộ nhớ cache toàn cục cho mọi hook useQuery/useMutation */}
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Ẩn header cho recap: tab bar tự động không có vì route này nằm ngoài (tabs) —
                không cần cấu hình gì thêm cho việc đó */}
            <Stack.Screen name="recap/[matchId]" options={{ headerShown: false }} />
            {/* presentation: 'modal' (không phải fullScreenModal) — cho vuốt xuống đóng mặc định,
                đúng yêu cầu acceptance criteria F-002. Chưa chặn vuốt xuống lúc đang làm quiz dở,
                việc đó thuộc Sprint 3 */}
            <Stack.Screen
              name="modal/quiz-room"
              options={{ presentation: 'modal', title: 'Phòng chờ Quiz' }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
