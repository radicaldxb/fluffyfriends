-- Run in Supabase SQL Editor to create the waitlist table for gift sign-up.
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  type text NOT NULL DEFAULT 'gift',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_anon" ON waitlist
  FOR INSERT TO anon
  WITH CHECK (true);
