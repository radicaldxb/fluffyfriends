-- ============================================================
-- RUN ONLY THIS FILE IN SUPABASE SQL EDITOR
-- This RENAMES the table "posts" to "pet_portraits". It does
-- NOT create any table. If you see "relation posts already
-- exists", you ran the wrong file (001 or 002). Run this one.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'posts'
  ) THEN
    ALTER TABLE public.posts RENAME TO pet_portraits;
    ALTER POLICY "posts_select_all" ON public.pet_portraits RENAME TO "pet_portraits_select_all";
    ALTER POLICY "posts_insert_authenticated" ON public.pet_portraits RENAME TO "pet_portraits_insert_authenticated";
  END IF;
END $$;
