import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/template';
import { useProfile } from '@/hooks/useProfile';
import { Colors } from '@/constants/theme';

export default function RootScreen() {
  const { user, loading } = useAuth();
  const { profile, profileLoading } = useProfile();
  const router = useRouter();

  // Use a ref to prevent multiple redirects
  const redirected = React.useRef(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user]);

  React.useEffect(() => {
    if (profile && !redirected.current) {
      redirected.current = true;
      const role = profile.role?.toLowerCase();
      console.log('[Root] Current Profile Role:', role);

      if (role === 'ministry') {
        console.log('[Root] Redirecting to Ministry Dashboard');
        router.replace('/(ministry)');
      } else if (role === 'club_president') {
        console.log('[Root] Redirecting to President Dashboard');
        router.replace('/(president)');
      } else {
        console.log('[Root] Redirecting to Student Dashboard');
        router.replace('/(student)');
      }
    }
  }, [profile]);

  if (loading || (user && profileLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
