import { getSupabaseClient } from '@/template';
import type { Club } from '@/constants/data';

export async function fetchClubs(): Promise<Club[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('name');
  if (error) return [];
  return (data as Club[]) || [];
}

export async function fetchClubById(id: string): Promise<Club | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Club;
}

export async function fetchClubByPresidentId(presidentId: string): Promise<Club | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('president_id', presidentId)
    .single();
  if (error) return null;
  return data as Club;
}

export async function updateClubMembersCount(clubId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { count } = await supabase
    .from('club_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('status', 'approved');
  await supabase
    .from('clubs')
    .update({ members_count: count || 0 })
    .eq('id', clubId);
}

export async function assignPresidentToClub(clubId: string, presidentId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('clubs')
    .update({ president_id: presidentId })
    .eq('id', clubId);
  if (error) return { error: error.message };
  return { error: null };
}
