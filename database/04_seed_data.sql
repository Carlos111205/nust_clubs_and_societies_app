-- QUERY 9: Insert sample data (seed data)
 
-- 3 sample users
INSERT INTO users (email, full_name, role) VALUES
  ('alice@nust.ac.zw',  'Alice Mutasa',    'admin'),
  ('bob@nust.ac.zw',    'Bob Chikwanda',   'club_leader'),
  ('carol@nust.ac.zw',  'Carol Dube',      'student');
 
-- 5 sample clubs
-- The subquery (SELECT id FROM users WHERE email = ...) fetches
-- Bob's UUID automatically so you don't have to type it manually
INSERT INTO clubs (name, description, category, is_featured, created_by)
VALUES
  ('NUST Tech Society',
   'Hackathons, coding workshops, and tech talks for all levels.',
   'Tech', true,
   (SELECT id FROM users WHERE email = 'bob@nust.ac.zw')),
 
  ('Chess Club',
   'Weekly tournaments open to all skill levels. Beginners welcome.',
   'Sports', true,
   (SELECT id FROM users WHERE email = 'bob@nust.ac.zw')),
 
  ('Drama & Arts Society',
   'Annual plays, open mic nights, and creative expression workshops.',
   'Arts', true,
   (SELECT id FROM users WHERE email = 'bob@nust.ac.zw')),
 
  ('Football Club',
   'Training every Tuesday and Thursday at the main sports field.',
   'Sports', false,
   (SELECT id FROM users WHERE email = 'bob@nust.ac.zw')),
 
  ('Photography Society',
   'Exploring campus and the city through our lenses.',
   'Arts', false,
   (SELECT id FROM users WHERE email = 'bob@nust.ac.zw'));
 
-- 4 sample events
INSERT INTO events (club_id, title, description, date_time, location)
VALUES
  ((SELECT id FROM clubs WHERE name = 'NUST Tech Society'),
   'Annual Hackathon 2025',
   '24-hour coding challenge. Register in teams of 4. Prizes for top 3.',
   '2025-09-15 08:00:00+02', 'Engineering Block A, Room 101'),
 
  ((SELECT id FROM clubs WHERE name = 'Chess Club'),
   'Inter-Faculty Chess Tournament',
   'Open to all faculties. Bring your student ID.',
   '2025-08-20 14:00:00+02', 'Student Centre, Ground Floor'),
 
  ((SELECT id FROM clubs WHERE name = 'Drama & Arts Society'),
   'End of Year Play: Hamlet',
   'Full production of Hamlet. Free entry for all students.',
   '2025-11-30 18:00:00+02', 'NUST Theatre'),
 
  ((SELECT id FROM clubs WHERE name = 'Football Club'),
   'Friendly Match vs MSU',
   'Pre-season friendly against Midlands State University.',
   '2025-07-10 10:00:00+02', 'Main Sports Field');
 
-- Carol joins two clubs
-- The trigger will automatically update member_count
INSERT INTO memberships (user_id, club_id) VALUES
  ((SELECT id FROM users WHERE email = 'carol@nust.ac.zw'),
   (SELECT id FROM clubs WHERE name = 'NUST Tech Society')),
  ((SELECT id FROM users WHERE email = 'carol@nust.ac.zw'),
   (SELECT id FROM clubs WHERE name = 'Chess Club'));
 
-- Carol saves one event as a bookmark
INSERT INTO saved_events (user_id, event_id) VALUES
  ((SELECT id FROM users WHERE email = 'carol@nust.ac.zw'),
   (SELECT id FROM events WHERE title = 'Annual Hackathon 2025'));
 
-- Insert one announcement
INSERT INTO announcements (title, body) VALUES
  ('Welcome Back Students!',
   'Club registration for the 2025 academic year is now open. '
   || 'Use this app to discover and join clubs on campus.');
