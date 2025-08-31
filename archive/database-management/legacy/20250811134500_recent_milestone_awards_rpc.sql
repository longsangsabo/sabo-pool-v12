-- Recent Milestone Awards RPC
-- Date: 2025-08-11
-- Provides recent awards for authenticated user

CREATE OR REPLACE FUNCTION public.recent_milestone_awards(p_limit INT DEFAULT 20)
RETURNS TABLE(
  milestone_id UUID,
  milestone_name TEXT,
  badge_icon TEXT,
  badge_color TEXT,
  event_type TEXT,
  spa_points_awarded INT,
  occurrence INT,
  status TEXT,
  awarded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT ma.milestone_id,
         m.name,
         m.badge_icon,
         m.badge_color,
         ma.event_type,
         ma.spa_points_awarded,
         ma.occurrence,
         ma.status,
         ma.awarded_at
  FROM public.milestone_awards ma
  LEFT JOIN public.milestones m ON m.id = ma.milestone_id
  WHERE ma.player_id = auth.uid()
  ORDER BY ma.awarded_at DESC
  LIMIT p_limit;
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure only select for authenticated users via RLS or explicit grant
GRANT EXECUTE ON FUNCTION public.recent_milestone_awards(INT) TO authenticated;
