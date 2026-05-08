// Types for the NUST Clubs & Societies App

export type Category = 'All' | 'Academic' | 'Sports' | 'Arts' | 'Tech' | 'Cultural' | 'Social';
export type Role = 'student' | 'club_president' | 'ministry';
export type MembershipStatus = 'pending' | 'approved' | 'rejected';

export interface Club {
  id: string;
  name: string;
  short_name: string;
  category: string;
  description: string;
  long_description: string;
  president_id: string | null;
  members_count: number;
  founded: string;
  email: string;
  meeting_day: string;
  meeting_time: string;
  location: string;
  icon_letter: string;
  cover_color: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  email: string;
  full_name: string | null;
  student_id: string | null;
  role: Role;
  club_id: string | null;
  avatar_color: string;
}

export interface ClubMembership {
  id: string;
  club_id: string;
  user_id: string;
  status: MembershipStatus;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  club?: Club;
  user?: Profile;
}

export interface ClubUpdate {
  id: string;
  club_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  club?: Pick<Club, 'id' | 'name' | 'short_name' | 'cover_color' | 'icon_letter'>;
  author?: Pick<Profile, 'id' | 'full_name' | 'email'>;
}

export interface ClubEvent {
  id: string;
  club_id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  created_by: string | null;
  created_at: string;
  club?: Pick<Club, 'id' | 'name' | 'short_name' | 'cover_color' | 'icon_letter' | 'category'>;
}

export const CATEGORIES: Category[] = ['All', 'Academic', 'Sports', 'Arts', 'Tech', 'Cultural', 'Social'];

export const CATEGORY_COLORS: Record<string, string> = {
  Academic: '#4DA6FF',
  Sports: '#22D76A',
  Arts: '#FF6BA8',
  Tech: '#9B6BFF',
  Cultural: '#FF9B3D',
  Social: '#3DDCFF',
  All: '#FFD700',
};
