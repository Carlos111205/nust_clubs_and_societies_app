import { AlertProvider, AuthProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProfileProvider } from '@/contexts/ProfileContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <ProfileProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#070D1A' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
              <Stack.Screen name="(student)" options={{ headerShown: false }} />
              <Stack.Screen name="(president)" options={{ headerShown: false }} />
              <Stack.Screen name="(ministry)" options={{ headerShown: false }} />
              <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
            </Stack>
          </ProfileProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
