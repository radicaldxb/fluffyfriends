-- Rejection context for Creative + pb_content_queue columns.
-- Run in Supabase SQL editor (or your migration process).

ALTER TABLE pb_content_queue
  ADD COLUMN IF NOT EXISTS rejection_category text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

CREATE OR REPLACE FUNCTION get_next_creative_brief()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  brief_record RECORD;
BEGIN
  SELECT * INTO brief_record
  FROM pb_content_queue
  WHERE status = 'pending_creative'
  ORDER BY scheduled_for ASC NULLS LAST
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  UPDATE pb_content_queue
  SET status = 'creative_in_progress', updated_at = now()
  WHERE id = brief_record.id;

  SELECT json_build_object(
    'brief', json_build_object(
      'id', brief_record.id,
      'platform', brief_record.platform,
      'post_type', brief_record.post_type,
      'goal', brief_record.goal,
      'theme', brief_record.theme,
      'pet_type', brief_record.pet_type,
      'tone', brief_record.tone,
      'visual_mood', brief_record.visual_mood,
      'overlay_caption', brief_record.overlay_caption,
      'caption_a', brief_record.caption_a,
      'hashtags', brief_record.hashtags,
      'gemini_prompt', brief_record.gemini_prompt,
      'cta', brief_record.cta,
      'ab_variable', brief_record.ab_variable,
      'ab_hypothesis', brief_record.ab_hypothesis,
      'scheduled_for', brief_record.scheduled_for,
      'week_number', brief_record.week_number,
      'rejection_reason', brief_record.rejection_reason,
      'rejection_category', brief_record.rejection_category
    ),
    'brand', json_build_object(
      'positioning', (SELECT json_object_agg(key, value) FROM pb_brand_positioning),
      'guide', (
        SELECT json_object_agg(category || '_' || key, value)
        FROM pb_brand_guide
        WHERE category IN ('colour', 'typography', 'visual', 'post_type', 'cloudinary')
      ),
      'decisions', (
        SELECT COALESCE(json_agg(json_build_object('title', title, 'content_impact', content_impact)), '[]'::json)
        FROM pb_product_decisions
        WHERE status = 'active'
      )
    )
  ) INTO result;

  RETURN result;
END;
$$;
