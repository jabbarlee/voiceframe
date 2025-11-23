-- ============================================================================
-- VOICEFRAME - Database Migration Rollback Script
-- ============================================================================
-- This script safely removes all database objects created by the migration.
-- Use this ONLY if you need to completely reset your database.
-- 
-- ⚠️  WARNING: This will DELETE ALL DATA in the VoiceFrame tables!
-- ⚠️  Make sure you have a backup before running this script!
-- 
-- USAGE:
-- 1. Backup your data first!
-- 2. Run this script in Supabase SQL Editor
-- 3. Verify all objects are removed
-- 4. Re-run complete_migration.sql if needed
-- ============================================================================

-- ============================================================================
-- 1. DROP STORAGE BUCKET POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can upload own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can access all audio files" ON storage.objects;


-- ============================================================================
-- 2. DROP RLS POLICIES
-- ============================================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- Audio files table policies
DROP POLICY IF EXISTS "Users can view own audio files" ON public.audio_files;
DROP POLICY IF EXISTS "Users can insert own audio files" ON public.audio_files;
DROP POLICY IF EXISTS "Users can update own audio files" ON public.audio_files;
DROP POLICY IF EXISTS "Users can delete own audio files" ON public.audio_files;
DROP POLICY IF EXISTS "Service role can manage audio files" ON public.audio_files;

-- Transcripts table policies
DROP POLICY IF EXISTS "Users can view own transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Users can insert own transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Users can update own transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Users can delete own transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Service role can manage transcripts" ON public.transcripts;

-- Learning content table policies
DROP POLICY IF EXISTS "Users can view own learning content" ON public.learning_content;
DROP POLICY IF EXISTS "Users can insert own learning content" ON public.learning_content;
DROP POLICY IF EXISTS "Users can update own learning content" ON public.learning_content;
DROP POLICY IF EXISTS "Users can delete own learning content" ON public.learning_content;
DROP POLICY IF EXISTS "Service role can manage learning content" ON public.learning_content;

-- User usage table policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Service role can manage usage" ON public.user_usage;

-- Cost tracking table policies
DROP POLICY IF EXISTS "Users can view own cost tracking" ON public.user_cost_tracking;
DROP POLICY IF EXISTS "Service role can manage cost tracking" ON public.user_cost_tracking;
DROP POLICY IF EXISTS "Users can view own cost log" ON public.cost_log;
DROP POLICY IF EXISTS "Service role can manage cost log" ON public.cost_log;


-- ============================================================================
-- 3. DROP TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_audio_files_updated_at ON public.audio_files;
DROP TRIGGER IF EXISTS update_transcripts_updated_at ON public.transcripts;
DROP TRIGGER IF EXISTS update_learning_content_updated_at ON public.learning_content;
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON public.user_usage;
DROP TRIGGER IF EXISTS update_user_cost_tracking_updated_at ON public.user_cost_tracking;


-- ============================================================================
-- 4. DROP TABLES (in reverse order due to foreign key constraints)
-- ============================================================================

DROP TABLE IF EXISTS public.cost_log CASCADE;
DROP TABLE IF EXISTS public.user_cost_tracking CASCADE;
DROP TABLE IF EXISTS public.learning_content CASCADE;
DROP TABLE IF EXISTS public.transcripts CASCADE;
DROP TABLE IF EXISTS public.user_usage CASCADE;
DROP TABLE IF EXISTS public.audio_files CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;


-- ============================================================================
-- 5. DROP FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;


-- ============================================================================
-- 6. REMOVE STORAGE BUCKET
-- ============================================================================

-- Note: This needs to be done in the Supabase Storage dashboard or via API
-- You cannot drop storage buckets directly via SQL
-- 
-- To manually remove the bucket:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Select 'audio-files' bucket
-- 3. Click the menu (three dots) > Delete bucket
-- 
-- Alternatively, use the Supabase client:
-- await supabase.storage.deleteBucket('audio-files')


-- ============================================================================
-- 7. DROP EXTENSIONS (Optional - only if not used by other tables)
-- ============================================================================

-- Uncomment these lines only if you're absolutely sure no other tables use these extensions
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
-- DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;


-- ============================================================================
-- 8. VERIFICATION
-- ============================================================================

-- Verify all tables are dropped
DO $$
DECLARE
    remaining_tables TEXT;
BEGIN
    SELECT string_agg(table_name, ', ')
    INTO remaining_tables
    FROM information_schema.tables
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN (
        'users', 'audio_files', 'transcripts', 'learning_content', 
        'user_usage', 'user_cost_tracking', 'cost_log'
      );
    
    IF remaining_tables IS NOT NULL THEN
        RAISE NOTICE 'WARNING: The following VoiceFrame tables still exist: %', remaining_tables;
    ELSE
        RAISE NOTICE 'SUCCESS: All VoiceFrame tables have been dropped';
    END IF;
END $$;

-- Verify triggers are dropped
DO $$
DECLARE
    remaining_triggers TEXT;
BEGIN
    SELECT string_agg(trigger_name, ', ')
    INTO remaining_triggers
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND trigger_name LIKE '%update%updated_at';
    
    IF remaining_triggers IS NOT NULL THEN
        RAISE NOTICE 'WARNING: The following triggers still exist: %', remaining_triggers;
    ELSE
        RAISE NOTICE 'SUCCESS: All VoiceFrame triggers have been dropped';
    END IF;
END $$;

-- Verify functions are dropped
DO $$
DECLARE
    function_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE 'WARNING: update_updated_at_column function still exists';
    ELSE
        RAISE NOTICE 'SUCCESS: All VoiceFrame functions have been dropped';
    END IF;
END $$;


-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================
-- 
-- The database has been rolled back to its state before the migration.
-- 
-- NEXT STEPS:
-- 
-- 1. Verify the rollback was successful by checking the notices above
-- 
-- 2. Manually delete the storage bucket if needed:
--    - Supabase Dashboard > Storage > audio-files > Delete
-- 
-- 3. If you want to re-run the migration:
--    - Run complete_migration.sql again
-- 
-- 4. If you had data to preserve:
--    - Restore from your backup using pg_restore or Supabase's restore feature
-- 
-- ============================================================================

