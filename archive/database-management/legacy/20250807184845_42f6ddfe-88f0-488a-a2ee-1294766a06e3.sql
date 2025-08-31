-- Fix the specific user's club data with all required fields
-- Check if club registration already exists first
DO $$
DECLARE
    v_registration_exists BOOLEAN;
    v_profile_exists BOOLEAN;
BEGIN
    -- Check if registration exists
    SELECT EXISTS(
        SELECT 1 FROM public.club_registrations 
        WHERE user_id = '18f49e79-f402-46d1-90be-889006e9761c'
    ) INTO v_registration_exists;
    
    -- Check if profile exists
    SELECT EXISTS(
        SELECT 1 FROM public.club_profiles 
        WHERE user_id = '18f49e79-f402-46d1-90be-889006e9761c'
    ) INTO v_profile_exists;
    
    -- Create registration if it doesn't exist
    IF NOT v_registration_exists THEN
        INSERT INTO public.club_registrations (
            id,
            user_id,
            club_name,
            address,
            district,
            city,
            province,
            phone,
            status,
            approval_date,
            table_count,
            basic_hourly_rate,
            table_types,
            opening_hours,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            '18f49e79-f402-46d1-90be-889006e9761c',
            'SBO POOL ARENA',
            '601A NGUYỄN AN NINH',
            'Quận 1',
            'Hồ Chí Minh',
            'Hồ Chí Minh',
            '0793259316',
            'approved',
            NOW(),
            10,
            50000,
            ARRAY['Standard', 'Pool'],
            '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "23:00"}}'::jsonb,
            '2025-08-07 03:14:32.652455+00',
            NOW()
        );
    END IF;
    
    -- Create profile if it doesn't exist
    IF NOT v_profile_exists THEN
        INSERT INTO public.club_profiles (
            user_id,
            club_name,
            address,
            phone,
            verification_status,
            hourly_rate,
            available_tables,
            created_at,
            updated_at
        ) VALUES (
            '18f49e79-f402-46d1-90be-889006e9761c',
            'SBO POOL ARENA',
            '601A NGUYỄN AN NINH',
            '0793259316',
            'approved',
            50000,
            10,
            NOW(),
            NOW()
        );
    END IF;
    
    -- Update user role to club_owner
    UPDATE public.profiles 
    SET role = 'club_owner', updated_at = NOW()
    WHERE user_id = '18f49e79-f402-46d1-90be-889006e9761c';
    
    -- Send notification to the user
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        auto_popup
    ) VALUES (
        '18f49e79-f402-46d1-90be-889006e9761c',
        'club_approved',
        'Câu lạc bộ đã được kích hoạt!',
        'Câu lạc bộ "SBO POOL ARENA" của bạn đã được kích hoạt và bạn có thể quản lý câu lạc bộ.',
        '/club-dashboard',
        true
    );
    
END $$;