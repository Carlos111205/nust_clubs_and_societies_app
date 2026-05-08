import { getSupabaseClient } from '@/template';
import type { ClubEvent } from '@/constants/data';

export async function getClubEvents(clubId: string): Promise<ClubEvent[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_events')
    .select('*')
    .eq('club_id', clubId)
    .order('date', { ascending: true });
  if (error) return [];
  return (data as ClubEvent[]) || [];
}

export async function getAllEvents(): Promise<ClubEvent[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_events')
    .select('*, club:clubs(id, name, short_name, cover_color, icon_letter, category)')
    .order('date', { ascending: true });
  if (error) return [];
  return (data as ClubEvent[]) || [];
}

export async function createEvent(
  clubId: string,
  createdBy: string,
  eventData: { title: string; description: string; date: string; time: string; location: string; max_attendees: number }
): Promise<{ data: ClubEvent | null; error: string | null }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('club_events')
    .insert({ club_id: clubId, created_by: createdBy, ...eventData })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as ClubEvent, error: null };
}

export async function deleteEvent(eventId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('club_events')
    .delete()
    .eq('id', eventId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function registerForEvent(eventId: string, userId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('event_registrations')
    .insert({ event_id: eventId, user_id: userId });
  if (error) return { error: error.message };
  return { error: null };
}

export async function unregisterFromEvent(eventId: string, userId: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getMyEventRegistrations(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('user_id', userId);
  if (error) return [];
  return (data || []).map((r: { event_id: string }) => r.event_id);
}
