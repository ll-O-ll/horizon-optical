-- Run this script in the Nhost / Hasura SQL editor

CREATE TABLE IF NOT EXISTS public.timetable_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week integer NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    interval_minutes integer DEFAULT 60 NOT NULL
);

-- Grant select permission to the public so the booking page can read it anonymously
-- (Admin uses x-hasura-admin-secret, which bypasses permissions)
-- Note: Replace this with the actual Hasura Metadata tracking step if you prefer using the "Track Table" button in the Nhost Console.
