import { getSupabaseClient } from '@/template';
import type { ClubMembership } from '@/constants/data';

export async function requestToJoin(clubId: string, userId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('club_memberships')
    .insert({ club_id: clubId, user_id: userId, status: 'pending' });
  if (error) return { error: error.message };
  return { error: null };
}

export async function cancelRequest(clubId: string, userId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('club_memberships')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', userId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getMyMemberships(userId: string): Promise<ClubMembership[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*, club:clubs(*)')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false });
  if (error) return [];
  return (data as ClubMembership[]) || [];
}

export async function getMyMembershipForClub(clubId: string, userId: string): Promise<ClubMembership | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data as ClubMembership;
}

export async function getPendingRequests(clubId: string): Promise<ClubMembership[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*, user:user_profiles(id, full_name, email, student_id, avatar_color)')
    .eq('club_id', clubId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });
  if (error) return [];
  return (data as ClubMembership[]) || [];
}

export async function getClubMembers(clubId: string): Promise<ClubMembership[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*, user:user_profiles(id, full_name, email, student_id, avatar_color)')
    .eq('club_id', clubId)
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false });
  if (error) return [];
  return (data as ClubMembership[]) || [];
}

export async function reviewMembership(
  membershipId: string,
  status: 'approved' | 'rejected',
  reviewerId: string
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('club_memberships')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq('id', membershipId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getAllMembershipsWithClub(): Promise<ClubMembership[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*, user:user_profiles(id, full_name, email), club:clubs(id, name, short_name, cover_color)')
    .order('requested_at', { ascending: false });
  if (error) return [];
  return (data as ClubMembership[]) || [];
}
