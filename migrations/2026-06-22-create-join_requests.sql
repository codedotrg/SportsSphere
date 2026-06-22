-- migration: create join_requests table
-- Run this in your migration system or psql

CREATE TABLE IF NOT EXISTS public.join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  requester_name text,
  requester_email text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional indexes
CREATE INDEX IF NOT EXISTS idx_join_requests_event_id ON public.join_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_requester_id ON public.join_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON public.join_requests(status);
