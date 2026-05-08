import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/template';
import { fetchProfile } from '@/services/profile';
import type { Profile } from '@/constants/data';

interface ProfileContextType {
  profile: Profile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: (p: Profile | null) => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const p = await fetchProfile(user.id);
    setProfile(p);
    setProfileLoading(false);
  }, [user]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <ProfileContext.Provider value={{ profile, profileLoading, refreshProfile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
