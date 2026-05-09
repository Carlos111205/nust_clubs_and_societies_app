-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Clubs Table
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    president_id UUID,
    members_count INTEGER DEFAULT 0,
    founded TEXT,
    email TEXT,
    meeting_day TEXT,
    meeting_time TEXT,
    location TEXT,
    icon_letter TEXT,
    cover_color TEXT DEFAULT '#FFD700',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for clubs and handle potential legacy constraints
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS benefits TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS icon_emoji TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS president_id UUID;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS members_count INTEGER DEFAULT 0;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS founded TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS meeting_day TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS meeting_time TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS icon_letter TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS cover_color TEXT DEFAULT '#FFD700';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix legacy constraints for columns that might already exist
DO $$ 
BEGIN 
    -- Make benefits nullable if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'benefits') THEN
        ALTER TABLE public.clubs ALTER COLUMN benefits DROP NOT NULL;
    END IF;
    
    -- Make other potential legacy columns nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'icon_emoji') THEN
        ALTER TABLE public.clubs ALTER COLUMN icon_emoji DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'image_url') THEN
        ALTER TABLE public.clubs ALTER COLUMN image_url DROP NOT NULL;
    END IF;
END $$;

-- User Profiles Table (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    student_id TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'club_president', 'ministry')),
    club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
    avatar_color TEXT DEFAULT '#FFD700',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure club_id column exists in user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS club_id UUID;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_color TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- Add foreign key to clubs for president_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_president') THEN
        ALTER TABLE public.clubs 
        ADD CONSTRAINT fk_president 
        FOREIGN KEY (president_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Club Memberships Table
CREATE TABLE IF NOT EXISTS public.club_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.user_profiles(id),
    UNIQUE(club_id, user_id)
);

-- Ensure columns exist for memberships
ALTER TABLE public.club_memberships ADD COLUMN IF NOT EXISTS club_id UUID;
ALTER TABLE public.club_memberships ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.club_memberships ADD COLUMN IF NOT EXISTS reviewed_by UUID;

-- Club Events Table
CREATE TABLE IF NOT EXISTS public.club_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TEXT,
    location TEXT,
    max_attendees INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for events
ALTER TABLE public.club_events ADD COLUMN IF NOT EXISTS club_id UUID;
ALTER TABLE public.club_events ADD COLUMN IF NOT EXISTS created_by UUID;

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    event_id UUID REFERENCES public.club_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- Ensure columns exist for registrations
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS user_id UUID;

-- Club Updates Table
CREATE TABLE IF NOT EXISTS public.club_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.user_profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for updates
ALTER TABLE public.club_updates ADD COLUMN IF NOT EXISTS club_id UUID;
ALTER TABLE public.club_updates ADD COLUMN IF NOT EXISTS author_id UUID;

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_updates ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- User Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Clubs
DROP POLICY IF EXISTS "Clubs are viewable by everyone" ON public.clubs;
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Presidents can update their own club" ON public.clubs;
CREATE POLICY "Presidents can update their own club" ON public.clubs FOR UPDATE 
USING (auth.uid() = president_id);

DROP POLICY IF EXISTS "Ministry can manage all clubs" ON public.clubs;
CREATE POLICY "Ministry can manage all clubs" ON public.clubs FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'ministry'));

-- Memberships
DROP POLICY IF EXISTS "Users can see their own memberships" ON public.club_memberships;
CREATE POLICY "Users can see their own memberships" ON public.club_memberships FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Presidents can see their club memberships" ON public.club_memberships;
CREATE POLICY "Presidents can see their club memberships" ON public.club_memberships FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND president_id = auth.uid()));

DROP POLICY IF EXISTS "Users can request to join" ON public.club_memberships;
CREATE POLICY "Users can request to join" ON public.club_memberships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Ministry can manage all memberships" ON public.club_memberships;
CREATE POLICY "Ministry can manage all memberships" ON public.club_memberships FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'ministry'));

-- Events & Updates
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.club_events;
CREATE POLICY "Events are viewable by everyone" ON public.club_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Presidents can manage events" ON public.club_events;
CREATE POLICY "Presidents can manage events" ON public.club_events FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND president_id = auth.uid()));

DROP POLICY IF EXISTS "Ministry can manage all events" ON public.club_events;
CREATE POLICY "Ministry can manage all events" ON public.club_events FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'ministry'));

DROP POLICY IF EXISTS "Updates are viewable by everyone" ON public.club_updates;
CREATE POLICY "Updates are viewable by everyone" ON public.club_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Presidents can manage updates" ON public.club_updates;
CREATE POLICY "Presidents can manage updates" ON public.club_updates FOR ALL 
USING (EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND president_id = auth.uid()));

DROP POLICY IF EXISTS "Ministry can manage all updates" ON public.club_updates;
CREATE POLICY "Ministry can manage all updates" ON public.club_updates FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'ministry'));

-- Event Registrations
DROP POLICY IF EXISTS "Registrations are viewable by user" ON public.event_registrations;
CREATE POLICY "Registrations are viewable by user" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. FUNCTIONS & TRIGGERS

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to clubs
DROP TRIGGER IF EXISTS on_clubs_updated ON public.clubs;
CREATE TRIGGER on_clubs_updated
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Profile creation on signup
-- Update this function in setup.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  access_code TEXT;
BEGIN
  -- Get the code from metadata
  access_code := new.raw_user_meta_data->>'ministry_access_code';

  -- Security Logic: Only allow 'ministry' role if code matches
  IF (new.raw_user_meta_data->>'role' = 'ministry') THEN
    IF (access_code != 'NUST_ADMIN_2026') THEN -- Replace with your actual secret
      RAISE EXCEPTION 'Invalid Ministry Access Code';
    END IF;
  END IF;

  INSERT INTO public.user_profiles (id, email, full_name, avatar_color, role, student_id)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'avatar_color', '#FFD700'), 
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'student_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Member count updates
CREATE OR REPLACE FUNCTION public.update_club_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.clubs 
    SET members_count = (
      SELECT count(*) FROM public.club_memberships 
      WHERE club_id = NEW.club_id AND status = 'approved'
    )
    WHERE id = NEW.club_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.clubs 
    SET members_count = (
      SELECT count(*) FROM public.club_memberships 
      WHERE club_id = OLD.club_id AND status = 'approved'
    )
    WHERE id = OLD.club_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_membership_change ON public.club_memberships;
CREATE TRIGGER on_membership_change
  AFTER INSERT OR UPDATE OR DELETE ON public.club_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_club_members_count();

CREATE OR REPLACE FUNCTION public.check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_cap INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.event_registrations WHERE event_id = NEW.event_id;
  SELECT max_attendees INTO max_cap FROM public.club_events WHERE id = NEW.event_id;

  IF (max_cap > 0 AND current_count >= max_cap) THEN
    RAISE EXCEPTION 'This event is already full.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_check_event_capacity
BEFORE INSERT ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.check_event_capacity();