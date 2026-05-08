-- Seed data for NUST Clubs & Societies

-- 1. Insert some initial clubs
INSERT INTO public.clubs (name, short_name, category, description, long_description, icon_letter, cover_color, is_featured)
VALUES 
('NUST Adventure Club', 'NAC', 'Sports', 'NUST Adventure Club is the biggest adventure club in NUST.', 'NUST Adventure Club (NAC) is the pioneer club of NUST, established to promote healthy and adventurous activities among students. We organize trekking, hiking, camping, and sightseeing trips across Pakistan.', 'A', '#22D76A', true),
('NUST Community Service Club', 'NCSC', 'Social', 'Dedicated to serving the community through various initiatives.', 'NUST Community Service Club (NCSC) is a student-run organization dedicated to providing help and support to the underprivileged members of our society through blood drives, education programs, and charity events.', 'C', '#3DDCFF', true),
('NUST Science Society', 'NSS', 'Tech', 'Promoting scientific temper and innovation among students.', 'NUST Science Society (NSS) aims to foster a culture of science and technology. We host the annual NUST Science Festival, workshops, and seminars on cutting-edge research.', 'S', '#9B6BFF', false),
('NUST Entrepreneurs Club', 'NEC', 'Academic', 'Fostering the spirit of entrepreneurship at NUST.', 'NUST Entrepreneurs Club (NEC) provides a platform for aspiring entrepreneurs to learn, network, and grow. We organize business plan competitions and guest speaker sessions with successful founders.', 'E', '#4DA6FF', true),
('NUST Dramatics Society', 'NDS', 'Arts', 'A platform for theater enthusiasts to showcase their talent.', 'NUST Dramatics Society (NDS) is home to the most creative minds in NUST. We produce high-quality theatrical performances and participate in national level dramatics competitions.', 'D', '#FF6BA8', false),
('NUST Cultural Society', 'NCS', 'Cultural', 'Celebrating the rich cultural diversity of Pakistan.', 'NUST Cultural Society (NCS) celebrates our roots through music, dance, and art. Our flagship event is the NUST Cultural Festival.', 'K', '#FF9B3D', false);

-- 2. Create some initial events
INSERT INTO public.club_events (club_id, title, description, date, time, location, max_attendees)
SELECT 
    id, 
    'Annual General Meeting', 
    'Welcome session for new members and introduction to the club executive body.', 
    CURRENT_DATE + INTERVAL '7 days', 
    '17:00', 
    'SADA Seminar Hall', 
    100
FROM public.clubs 
WHERE short_name = 'NAC';

INSERT INTO public.club_events (club_id, title, description, date, time, location, max_attendees)
SELECT 
    id, 
    'Margalla Hike', 
    'A weekend hike to Trail 3 with the NAC family.', 
    CURRENT_DATE + INTERVAL '14 days', 
    '07:00', 
    'Margalla Hills, Islamabad', 
    50
FROM public.clubs 
WHERE short_name = 'NAC';

INSERT INTO public.club_events (club_id, title, description, date, time, location, max_attendees)
SELECT 
    id, 
    'Blood Donation Drive', 
    'Join us in saving lives. Every drop counts.', 
    CURRENT_DATE + INTERVAL '5 days', 
    '09:00', 
    'C1 Car Parking', 
    500
FROM public.clubs 
WHERE short_name = 'NCSC';

-- 3. Create some initial updates
INSERT INTO public.club_updates (club_id, title, content)
SELECT 
    id, 
    'Recruitments Open!', 
    'We are excited to announce that NAC is now recruiting for the new semester. Apply now to be part of the adventure!'
FROM public.clubs 
WHERE short_name = 'NAC';

-- 4. FIXING USER ROLES (RUN THIS IF REDIRECTS FAIL)
-- This ensures any existing users you created manually have the correct role string
-- Replace 'your-email@example.com' with the email you used to sign up

-- To make yourself a Ministry user:
-- UPDATE public.user_profiles SET role = 'ministry' WHERE email = 'your-email@example.com';

-- To make yourself a Club President:
-- UPDATE public.user_profiles SET role = 'club_president', club_id = (SELECT id FROM public.clubs WHERE short_name = 'NAC' LIMIT 1) WHERE email = 'your-email@example.com';
