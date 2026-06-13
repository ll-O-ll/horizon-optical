-- ============================================
-- Client Portal Tables
-- Run this in Nhost Hasura SQL console
-- ============================================

-- 1. Client Resources table
CREATE TABLE IF NOT EXISTS public.client_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'pointer', -- 'recording', 'pointer', 'note'
    url TEXT, -- for recordings (YouTube, Drive, etc.)
    content TEXT, -- for pointers/notes (text content)
    category TEXT, -- free-form grouping (e.g. "Mobility", "Strength")
    order_index INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by client email
CREATE INDEX IF NOT EXISTS idx_client_resources_email ON public.client_resources(client_email);

-- 2. Client Portal Sessions table (for email verification)
CREATE TABLE IF NOT EXISTS public.client_portal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    access_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_portal_sessions_email ON public.client_portal_sessions(client_email);

-- Track both tables in Hasura (run in Hasura console or via metadata API)
-- After running the SQL, go to Hasura Data tab and click "Track" on both tables.
