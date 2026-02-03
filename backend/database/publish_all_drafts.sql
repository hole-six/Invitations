-- ============================================
-- SCRIPT: Publish all draft invitations
-- Description: Update all draft invitations to published status
-- ============================================

-- Update all draft invitations to published
UPDATE invitations 
SET 
    status = 'published',
    published_at = NOW(),
    updated_at = NOW()
WHERE status = 'draft';

-- Show results
SELECT 
    id,
    title,
    slug,
    status,
    visibility,
    published_at
FROM invitations
ORDER BY id DESC
LIMIT 20;
