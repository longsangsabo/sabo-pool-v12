-- 🔧 FIX REGISTRATION ERRORS: Phone Format và Handle New User Function
-- Thực hiện trong Supabase SQL Editor

-- =============================================================================
-- BƯỚC 1: FIX PHONE FORMAT ISSUES HIỆN TẠI
-- =============================================================================

-- Fix các phone numbers thiếu dấu +
UPDATE profiles SET phone = '+84362252625' WHERE user_id = '3757397f-4fcf-44f1-9b64-6f00209fa427';
UPDATE profiles SET phone = '+84705413592' WHERE user_id = 'a91de299-89d8-43b0-a3c6-0a8db9393f6c';
UPDATE profiles SET phone = '+84764682075' WHERE user_id = '363512b8-d1ef-43e9-87b1-09fe46096d15';
UPDATE profiles SET phone = '+84902842609' WHERE user_id = 'e9d48914-2c9b-46a3-9ce7-911df0c4819b';
UPDATE profiles SET phone = '+84327175839' WHERE user_id = 'fcf095fe-a968-4bf9-b97f-6716b7bb8c79';
UPDATE profiles SET phone = '+84364823089' WHERE user_id = '86361992-737a-4385-8885-168bf68abbbf';
UPDATE profiles SET phone = '+84333404305' WHERE user_id = 'bc5545c5-0bb9-488f-b2ba-16fa373e1f5e';
UPDATE profiles SET phone = '+84325607964' WHERE user_id = '21c71eb2-3a42-4589-9089-24a9340a0e6a';
UPDATE profiles SET phone = '+84374566345' WHERE user_id = '28977c56-7f3a-41e2-aef8-ab6a0e8dd6ce';
UPDATE profiles SET phone = '+84878360388' WHERE user_id = '7ac919f8-3957-4e5c-a5b8-f78d1f767b72';

-- =============================================================================
-- BƯỚC 2: CẬP NHẬT HANDLE_NEW_USER FUNCTION VỚI LOGGING VÀ ERROR HANDLING TỐT HƠN
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_phone TEXT;
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Log function start
  RAISE LOG 'handle_new_user: Processing new user %', NEW.id;
  
  -- Extract and validate phone number
  user_phone := NEW.phone;
  IF user_phone IS NOT NULL THEN
    -- Ensure phone is in E.164 format
    IF user_phone ~ '^84[0-9]{9,10}$' THEN
      user_phone := '+' || user_phone;
      RAISE LOG 'handle_new_user: Fixed phone format % -> %', NEW.phone, user_phone;
    ELSIF NOT (user_phone ~ '^\+84[0-9]{9,10}$' OR user_phone ~ '^0[0-9]{9,10}$') THEN
      RAISE WARNING 'handle_new_user: Invalid phone format for user %: %', NEW.id, user_phone;
      user_phone := NULL; -- Set to NULL for invalid formats
    END IF;
  END IF;
  
  -- Extract and validate full name
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'fullName',
    ''
  );
  
  -- Extract email
  user_email := NEW.email;
  
  -- Log extracted data
  RAISE LOG 'handle_new_user: Data for user % - name: %, phone: %, email: %', 
    NEW.id, user_name, user_phone, user_email;
  
  -- Use UPSERT to avoid duplicate key violation
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    user_name,
    user_email,
    user_phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = CASE 
      WHEN profiles.full_name IS NULL OR profiles.full_name = '' 
      THEN COALESCE(EXCLUDED.full_name, profiles.full_name)
      ELSE profiles.full_name 
    END,
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = CASE 
      WHEN profiles.phone IS NULL 
      THEN COALESCE(EXCLUDED.phone, profiles.phone)
      ELSE profiles.phone 
    END,
    updated_at = NOW();
  
  RAISE LOG 'handle_new_user: Successfully processed user %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE WARNING 'handle_new_user: Unique violation for user % (this is usually OK): %', NEW.id, SQLERRM;
    RETURN NEW;
  WHEN foreign_key_violation THEN
    RAISE WARNING 'handle_new_user: Foreign key violation for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log detailed error but don't block signup
    RAISE WARNING 'handle_new_user: Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RAISE LOG 'handle_new_user: Raw user data: %', NEW;
    RETURN NEW;
END;
$function$;

-- =============================================================================
-- BƯỚC 3: THÊM VALIDATION FUNCTION CHO PHONE FORMAT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_and_format_phone(input_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  -- Return NULL if input is NULL or empty
  IF input_phone IS NULL OR trim(input_phone) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-digit characters except +
  input_phone := regexp_replace(input_phone, '[^0-9+]', '', 'g');
  
  -- Handle different Vietnam phone formats
  CASE
    -- Already in +84 format
    WHEN input_phone ~ '^\+84[0-9]{9,10}$' THEN
      RETURN input_phone;
    
    -- Missing + but has 84 prefix
    WHEN input_phone ~ '^84[0-9]{9,10}$' THEN
      RETURN '+' || input_phone;
    
    -- Vietnam domestic format starting with 0
    WHEN input_phone ~ '^0[0-9]{9,10}$' THEN
      RETURN '+84' || substring(input_phone from 2);
    
    -- Invalid format
    ELSE
      RETURN NULL;
  END CASE;
END;
$function$;

-- =============================================================================
-- BƯỚC 4: CẬP NHẬT TRIGGER ĐỂ SỬ DỤNG FUNCTION MỚI
-- =============================================================================

-- Recreate trigger to ensure it's properly linked
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- BƯỚC 5: THÊM FUNCTION ĐỂ DEBUG REGISTRATION ISSUES
-- =============================================================================

CREATE OR REPLACE FUNCTION public.debug_user_registration(user_id_param UUID)
RETURNS TABLE (
  step TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  auth_user_exists BOOLEAN := FALSE;
  profile_exists BOOLEAN := FALSE;
  user_info RECORD;
  profile_info RECORD;
BEGIN
  -- Step 1: Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id_param) INTO auth_user_exists;
  
  RETURN QUERY SELECT 
    'auth_user'::TEXT,
    CASE WHEN auth_user_exists THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
    CASE WHEN auth_user_exists THEN 'User found in auth.users' ELSE 'User not found in auth.users' END::TEXT;
  
  IF auth_user_exists THEN
    -- Get auth user info
    SELECT email, phone, raw_user_meta_data INTO user_info
    FROM auth.users WHERE id = user_id_param;
    
    RETURN QUERY SELECT 
      'auth_details'::TEXT,
      'INFO'::TEXT,
      format('Email: %s, Phone: %s, Metadata: %s', 
        COALESCE(user_info.email, 'NULL'),
        COALESCE(user_info.phone, 'NULL'),
        COALESCE(user_info.raw_user_meta_data::TEXT, 'NULL')
      )::TEXT;
  END IF;
  
  -- Step 2: Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = user_id_param) INTO profile_exists;
  
  RETURN QUERY SELECT 
    'profile'::TEXT,
    CASE WHEN profile_exists THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
    CASE WHEN profile_exists THEN 'Profile found in public.profiles' ELSE 'Profile not found - trigger may have failed' END::TEXT;
  
  IF profile_exists THEN
    -- Get profile info
    SELECT full_name, email, phone INTO profile_info
    FROM public.profiles WHERE user_id = user_id_param;
    
    RETURN QUERY SELECT 
      'profile_details'::TEXT,
      'INFO'::TEXT,
      format('Name: %s, Email: %s, Phone: %s', 
        COALESCE(profile_info.full_name, 'NULL'),
        COALESCE(profile_info.email, 'NULL'),
        COALESCE(profile_info.phone, 'NULL')
      )::TEXT;
  END IF;
  
  RETURN;
END;
$function$;

-- =============================================================================
-- BƯỚC 6: KIỂM TRA TRIGGER HOẠT ĐỘNG
-- =============================================================================

-- Kiểm tra trigger tồn tại và enabled
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled 
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    ELSE 'UNKNOWN'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.proname = 'handle_new_user'
AND c.relname = 'users';

-- =============================================================================
-- THÔNG TIN HOÀN THÀNH
-- =============================================================================

-- Thông báo hoàn thành
DO $$
BEGIN
  RAISE NOTICE '✅ REGISTRATION FIX COMPLETED:';
  RAISE NOTICE '1. Fixed % phone numbers missing + prefix', (
    SELECT COUNT(*) FROM (VALUES 
      ('84362252625'), ('84705413592'), ('84764682075'), ('84902842609'), ('84327175839'),
      ('84364823089'), ('84333404305'), ('84325607964'), ('84374566345'), ('84878360388')
    ) AS v(phone)
  );
  RAISE NOTICE '2. Updated handle_new_user function with better error handling';
  RAISE NOTICE '3. Added phone validation function';
  RAISE NOTICE '4. Added debug function for registration issues';
  RAISE NOTICE '5. Recreated trigger to ensure proper linking';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TEST: Try registering a new user to see if errors are resolved';
  RAISE NOTICE '🔍 DEBUG: Use SELECT * FROM debug_user_registration(''user-id'') to troubleshoot specific users';
END $$;
