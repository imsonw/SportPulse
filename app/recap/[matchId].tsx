import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecapScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  // Không header, không tab bar (route ngoài (tabs), headerShown: false) — không ai tự động chừa
  // chỗ notch/home indicator, nên phải tự bảo vệ CẢ HAI cạnh top và bottom.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Recap trận #{matchId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
});
