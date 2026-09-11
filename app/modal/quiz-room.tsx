import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function QuizRoomScreen() {
  // Header (title: 'Phòng chờ Quiz') đã tự lo an toàn cạnh TOP — chỉ còn BOTTOM chưa ai bảo vệ,
  // vì modal không có tab bar và không tự động full-bleed dưới home indicator như push thường.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Phòng chờ Quiz</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
