import { getSupabaseClient } from '@/template';
import type { Profile, Role } from '@/constants/data';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'student_id' | 'role' | 'club_id' | 'avatar_color' | 'username'>>
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function setupProfile(
  userId: string,
  data: {
    full_name: string;
    student_id: string;
    role: Role;
    club_id?: string;
    avatar_color?: string;
  }
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('user_profiles')
    .update({
      full_name: data.full_name,
      student_id: data.student_id,
      role: data.role,
      club_id: data.club_id || null,
      avatar_color: data.avatar_color || '#FFD700',
    })
    .eq('id', userId);
  if (error) return { error: error.message };
  return { error: null };
}
