import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';

export default function PresidentTabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }),
          paddingHorizontal: 16,
          backgroundColor: '#0F1A2E',
          borderTopWidth: 1,
          borderTopColor: '#243050',
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#4A5A7A',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" size={size} color={color} /> }} />
      <Tabs.Screen name="requests" options={{ title: 'Requests', tabBarIcon: ({ color, size }) => <MaterialIcons name="person-add" size={size} color={color} /> }} />
      <Tabs.Screen name="updates" options={{ title: 'Updates', tabBarIcon: ({ color, size }) => <MaterialIcons name="campaign" size={size} color={color} /> }} />
      <Tabs.Screen name="members" options={{ title: 'Members', tabBarIcon: ({ color, size }) => <MaterialIcons name="group" size={size} color={color} /> }} />
      <Tabs.Screen name="menu" options={{ title: 'Menu', tabBarIcon: ({ color, size }) => <MaterialIcons name="menu" size={size} color={color} /> }} />
    </Tabs>
  );
}
