-- SQL script to insert mock events into the database
-- Uses the first available tenant ID dynamically
SET search_path TO drista_csr;
INSERT INTO events (
        id,
        tenant_id,
        title,
        slug,
        description,
        cover_image_url,
        event_type,
        location,
        start_datetime,
        end_datetime,
        status,
        registration_required,
        created_at,
        updated_at
    )
SELECT gen_random_uuid(),
    t.id,
    'Weekly Beach Cleanup',
    'weekly-beach-cleanup',
    'Join our dedicated team of volunteers for our weekly beach cleanup drive. Together, we can keep our coastlines plastic-free.',
    'https://images.unsplash.com/photo-1618477461853-cf6ed80fbea5?auto=format&fit=crop&q=80',
    'Environment',
    'Juhu Beach & Versova',
    '2026-03-08 07:00:00+05:30',
    '2026-03-08 11:00:00+05:30',
    'published',
    true,
    NOW(),
    NOW()
FROM tenants t
LIMIT 1;
INSERT INTO events (
        id,
        tenant_id,
        title,
        slug,
        description,
        cover_image_url,
        event_type,
        location,
        start_datetime,
        end_datetime,
        status,
        registration_required,
        created_at,
        updated_at
    )
SELECT gen_random_uuid(),
    t.id,
    'Education for All Initiative',
    'education-for-all-initiative',
    'Providing free evening tuitions and educational support to underprivileged children in the community.',
    'https://images.unsplash.com/photo-1577896851231-70ef18d867c8?auto=format&fit=crop&q=80',
    'Education',
    'Dharavi Community Center',
    '2026-03-02 16:00:00+05:30',
    '2026-03-02 18:00:00+05:30',
    'published',
    true,
    NOW(),
    NOW()
FROM tenants t
LIMIT 1;
INSERT INTO events (
        id,
        tenant_id,
        title,
        slug,
        description,
        cover_image_url,
        event_type,
        location,
        start_datetime,
        end_datetime,
        status,
        registration_required,
        created_at,
        updated_at
    )
SELECT gen_random_uuid(),
    t.id,
    'Annual Blood Donation Camp',
    'annual-blood-donation-camp',
    'Be a hero and save lives. Join our mega blood donation camp this Independence Day.',
    'https://images.unsplash.com/photo-1615461066159-fea0960485d5?auto=format&fit=crop&q=80',
    'Health',
    'Sion Hospital, Mumbai',
    '2026-08-15 09:00:00+05:30',
    '2026-08-15 17:00:00+05:30',
    'published',
    true,
    NOW(),
    NOW()
FROM tenants t
LIMIT 1;
INSERT INTO events (
        id,
        tenant_id,
        title,
        slug,
        description,
        cover_image_url,
        event_type,
        location,
        start_datetime,
        end_datetime,
        status,
        registration_required,
        created_at,
        updated_at
    )
SELECT gen_random_uuid(),
    t.id,
    'Monsoon Tree Plantation Drive',
    'monsoon-tree-plantation-drive',
    'Help us increase Mumbai''s green cover. We are planting 10,000 saplings this monsoon season.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80',
    'Environment',
    'Aarey Forest, Goregaon',
    '2026-07-05 08:00:00+05:30',
    '2026-07-05 13:00:00+05:30',
    'published',
    true,
    NOW(),
    NOW()
FROM tenants t
LIMIT 1;
INSERT INTO events (
        id,
        tenant_id,
        title,
        slug,
        description,
        cover_image_url,
        event_type,
        location,
        start_datetime,
        end_datetime,
        status,
        registration_required,
        created_at,
        updated_at
    )
SELECT gen_random_uuid(),
    t.id,
    'Empowerment Workshop for Women',
    'empowerment-workshop-for-women',
    'A skill-building and financial literacy workshop aimed at empowering women from low-income neighborhoods.',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80',
    'Empowerment',
    'Thane West Auditorium',
    '2026-09-10 10:00:00+05:30',
    '2026-09-10 16:00:00+05:30',
    'published',
    true,
    NOW(),
    NOW()
FROM tenants t
LIMIT 1;