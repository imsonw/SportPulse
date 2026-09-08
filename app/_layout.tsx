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
