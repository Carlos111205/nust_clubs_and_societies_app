-- QUERY 2: Create users table
CREATE TABLE users (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      text        NOT NULL UNIQUE,
  full_name  text        NOT NULL,
  avatar_url text,
  role       text        NOT NULL DEFAULT 'student'
               CHECK (role IN ('student', 'club_leader', 'admin')),
  dark_mode  boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
 
COMMENT ON TABLE users IS
  'App users with extra profile data beyond Supabase Auth';

-- QUERY 3: Create clubs table
CREATE TABLE clubs (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         text        NOT NULL,
  description  text,
  category     text        NOT NULL
                 CHECK (category IN ('Sports', 'Tech', 'Arts', 'Other')),
  image_url    text,
  member_count integer     NOT NULL DEFAULT 0
                 CHECK (member_count >= 0),
  is_featured  boolean     NOT NULL DEFAULT false,
  created_by   uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
 
COMMENT ON TABLE clubs IS 'All campus clubs and societies';
COMMENT ON COLUMN clubs.is_featured IS 'Max 3 clubs featured at any time';

-- QUERY 4: Create events table
CREATE TABLE events (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id     uuid        NOT NULL
                REFERENCES clubs(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text,
  date_time   timestamptz NOT NULL,
  location    text,
  is_past     boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
 
COMMENT ON TABLE events IS
  'Events created by clubs. Deleting a club deletes its events too.';

-- QUERY 5: Create memberships table
CREATE TABLE memberships (
  id        uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id   uuid        NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
 
  -- This line prevents a user from joining the same club twice
  UNIQUE(user_id, club_id)

-- QUERY 6: Create saved_events table
CREATE TABLE saved_events (
  id       uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id  uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
 
  -- Prevents saving the same event twice
  UNIQUE(user_id, event_id)
);
 
COMMENT ON TABLE saved_events IS 'Events bookmarked by users';

-- QUERY 7: Create announcements table
CREATE TABLE announcements (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      text        NOT NULL,
  body       text        NOT NULL,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
 
COMMENT ON TABLE announcements IS
  'Dismissible home screen banner messages';
