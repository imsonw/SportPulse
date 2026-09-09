import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function RecapScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  return (
    <View style={styles.container}>
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
