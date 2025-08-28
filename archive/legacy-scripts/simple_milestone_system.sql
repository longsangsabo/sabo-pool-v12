-- SIMPLE MILESTONE SYSTEM - Process awards directly in database
-- No Edge Function required - all logic in PostgreSQL
-- Date: 2025-08-11

CREATE OR REPLACE FUNCTION public.call_milestone_triggers(events_data jsonb[])
RETURNS jsonb AS $$
DECLARE
  ev jsonb;
  milestone_record RECORD;
  player_milestone_record RECORD;
  events_processed INTEGER := 0;
BEGIN
  -- Process each event
  FOR ev IN SELECT * FROM unnest(events_data)
  LOOP
    -- Insert milestone event
    INSERT INTO public.milestone_events(player_id, event_type, event_context, dedupe_key)
    VALUES (
      (ev->>'player_id')::uuid, 
      ev->>'event_type', 
      jsonb_build_object('batch', true, 'raw', ev), 
      ev->>'dedupe_key'
    )
    ON CONFLICT (player_id, event_type, dedupe_key) DO NOTHING;
    
    -- Find matching milestones for this event type
    FOR milestone_record IN 
      SELECT * FROM public.milestones 
      WHERE milestone_type = ev->>'event_type' 
      AND is_active = true
    LOOP
      -- Get or create player milestone progress
      INSERT INTO public.player_milestones (player_id, milestone_id, current_progress)
      VALUES ((ev->>'player_id')::uuid, milestone_record.id, 0)
      ON CONFLICT (player_id, milestone_id) DO NOTHING;
      
      -- Get current progress
      SELECT * INTO player_milestone_record
      FROM public.player_milestones pm
      WHERE pm.player_id = (ev->>'player_id')::uuid 
      AND pm.milestone_id = milestone_record.id;
      
      -- Update progress
      UPDATE public.player_milestones 
      SET 
        current_progress = current_progress + COALESCE((ev->>'value')::integer, 1),
        last_progress_update = NOW(),
        updated_at = NOW()
      WHERE player_id = (ev->>'player_id')::uuid 
      AND milestone_id = milestone_record.id;
      
      -- Check if milestone completed
      IF (player_milestone_record.current_progress + COALESCE((ev->>'value')::integer, 1)) >= milestone_record.requirement_value 
         AND NOT player_milestone_record.is_completed THEN
        
        -- Mark milestone as completed
        UPDATE public.player_milestones 
        SET 
          is_completed = true,
          completed_at = NOW(),
          times_completed = times_completed + 1
        WHERE player_id = (ev->>'player_id')::uuid 
        AND milestone_id = milestone_record.id;
        
        -- Create milestone award
        INSERT INTO public.milestone_awards (
          player_id,
          milestone_id,
          event_type,
          spa_points_awarded,
          status,
          awarded_at
        ) VALUES (
          (ev->>'player_id')::uuid,
          milestone_record.id,
          ev->>'event_type',
          milestone_record.spa_reward,
          'success',
          NOW()
        );
        
      END IF;
    END LOOP;
    
    events_processed := events_processed + 1;
  END LOOP;
  
  RETURN jsonb_build_object('events_processed', events_processed, 'status', 'success');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN RAISE NOTICE '✅ Created simple milestone system - no Edge Function required'; END $$;
