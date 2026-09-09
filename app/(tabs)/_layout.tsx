import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      {/* name="index" khớp file (tabs)/index.tsx — không phải khớp label "Trực tiếp" bên dưới */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trực tiếp',
          tabBarIcon: ({ color, size }) => <Ionicons name="tv-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="trivia"
        options={{
          title: 'Trivia',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'BXH',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
