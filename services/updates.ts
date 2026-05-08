import { getSupabaseClient } from '@/template';
import type { ClubUpdate } from '@/constants/data';

export async function createUpdate(
  clubId: string,
  authorId: string,
  title: string,
  content: string
): Promise<{ data: ClubUpdate | null; error: string | null }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_updates')
    .insert({ club_id: clubId, author_id: authorId, title, content })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as ClubUpdate, error: null };
}

export async function getClubUpdates(clubId: string): Promise<ClubUpdate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_updates')
    .select('*, author:user_profiles(id, full_name, email)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data as ClubUpdate[]) || [];
}

export async function getAllUpdates(): Promise<ClubUpdate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_updates')
    .select('*, club:clubs(id, name, short_name, cover_color, icon_letter), author:user_profiles(id, full_name, email)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return [];
  return (data as ClubUpdate[]) || [];
}

export async function deleteUpdate(updateId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('club_updates')
    .delete()
    .eq('id', updateId);
  if (error) return { error: error.message };
  return { error: null };
}
