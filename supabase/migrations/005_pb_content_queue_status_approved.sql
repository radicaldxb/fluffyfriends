-- Add 'approved' (and full status set) to pb_content_queue status check.
-- Run in Supabase SQL editor if migration runner is not used.

ALTER TABLE pb_content_queue DROP CONSTRAINT IF EXISTS pb_content_queue_status_check;

ALTER TABLE pb_content_queue ADD CONSTRAINT pb_content_queue_status_check
CHECK (status IN (
  'pending_creative', 'creative_in_progress', 'validating',
  'pending_approval', 'scheduled', 'approved', 'publishing', 'published',
  'validation_failed', 'cancelled'
));
