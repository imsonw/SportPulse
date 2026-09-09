import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function LiveScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trực tiếp</Text>
      {/* Card mẫu: push nhận string URL, "123" ở đây luôn là string dù match.id thật có là number */}
      <Pressable style={styles.card} onPress={() => router.push('/match/123')}>
        <Text style={styles.cardText}>Trận đấu mẫu #123 — bấm để xem chi tiết</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardText: {
    fontSize: 14,
  },
});
