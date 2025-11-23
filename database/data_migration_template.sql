-- ============================================================================
-- VOICEFRAME - Data Migration Template
-- ============================================================================
-- This script helps you migrate existing data from an old Supabase project
-- to a new one after running complete_migration.sql
-- 
-- PREREQUISITES:
-- 1. complete_migration.sql has been run on the NEW database
-- 2. You have credentials for BOTH old and new databases
-- 3. Both databases are accessible
-- 
-- USAGE OPTIONS:
-- 
-- Option 1: Using pg_dump/pg_restore (Recommended for large datasets)
-- Option 2: Using Supabase's export/import feature (Dashboard method)
-- Option 3: Using this SQL template with postgres_fdw extension
-- 
-- ============================================================================

-- ============================================================================
-- OPTION 1: Using pg_dump and pg_restore (RECOMMENDED)
-- ============================================================================
-- 
-- This is the safest and most reliable method for migrating data.
-- Run these commands in your terminal:
-- 
-- Step 1: Export data from OLD database
-- ```bash
-- pg_dump \
--   "postgresql://postgres:[OLD_PASSWORD]@db.[OLD_PROJECT_REF].supabase.co:5432/postgres" \
--   --data-only \
--   --table=public.users \
--   --table=public.audio_files \
--   --table=public.transcripts \
--   --table=public.learning_content \
--   --table=public.user_usage \
--   --table=public.user_cost_tracking \
--   --table=public.cost_log \
--   > voiceframe_data_export.sql
-- ```
-- 
-- Step 2: Import data to NEW database
-- ```bash
-- psql \
--   "postgresql://postgres:[NEW_PASSWORD]@db.[NEW_PROJECT_REF].supabase.co:5432/postgres" \
--   < voiceframe_data_export.sql
-- ```
-- 
-- Step 3: Verify data was migrated
-- ```sql
-- -- Run in NEW database
-- SELECT 'users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'audio_files', COUNT(*) FROM audio_files
-- UNION ALL
-- SELECT 'transcripts', COUNT(*) FROM transcripts
-- UNION ALL
-- SELECT 'learning_content', COUNT(*) FROM learning_content
-- UNION ALL
-- SELECT 'user_usage', COUNT(*) FROM user_usage
-- UNION ALL
-- SELECT 'user_cost_tracking', COUNT(*) FROM user_cost_tracking
-- UNION ALL
-- SELECT 'cost_log', COUNT(*) FROM cost_log;
-- ```
-- 
-- ============================================================================


-- ============================================================================
-- OPTION 2: Using Supabase Dashboard (Easiest for small datasets)
-- ============================================================================
-- 
-- Step 1: Export from OLD project
-- 1. Go to old Supabase project > Database > Backups
-- 2. Click "Download" on the most recent backup
-- 3. Save the .sql file
-- 
-- Step 2: Import to NEW project
-- 1. Extract only the data rows from the backup file
-- 2. Run them in the new project's SQL Editor
-- 
-- Note: This method requires manual editing of the backup file to extract
-- only INSERT statements for the relevant tables.
-- 
-- ============================================================================


-- ============================================================================
-- OPTION 3: Using Foreign Data Wrapper (Advanced)
-- ============================================================================
-- 
-- This method connects the new database to the old one and copies data.
-- Only use this if you're comfortable with PostgreSQL advanced features.
-- 
-- IMPORTANT: Replace placeholders with your actual connection details!
-- 
-- ============================================================================

-- Enable the postgres_fdw extension
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Create a foreign server connection to the OLD database
-- ⚠️ REPLACE THESE VALUES WITH YOUR OLD DATABASE CREDENTIALS
CREATE SERVER old_voiceframe_db
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (
        host 'db.[OLD_PROJECT_REF].supabase.co',
        port '5432',
        dbname 'postgres'
    );

-- Create user mapping for authentication
-- ⚠️ REPLACE [OLD_PASSWORD] WITH YOUR OLD DATABASE PASSWORD
CREATE USER MAPPING FOR postgres
    SERVER old_voiceframe_db
    OPTIONS (
        user 'postgres',
        password '[OLD_PASSWORD]'
    );

-- Import the foreign schema (this makes the old tables accessible)
CREATE SCHEMA IF NOT EXISTS old_db;

IMPORT FOREIGN SCHEMA public
    LIMIT TO (
        users,
        audio_files,
        transcripts,
        learning_content,
        user_usage,
        user_cost_tracking,
        cost_log
    )
    FROM SERVER old_voiceframe_db
    INTO old_db;

-- ============================================================================
-- DATA MIGRATION QUERIES
-- ============================================================================

-- Now you can copy data from old_db schema to public schema

-- 1. Migrate Users
-- Check for conflicts first
DO $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM old_db.users old
    INNER JOIN public.users new ON old.uid = new.uid;
    
    IF conflict_count > 0 THEN
        RAISE NOTICE 'WARNING: % users already exist in the new database', conflict_count;
        RAISE NOTICE 'Skipping existing users to avoid conflicts...';
    END IF;
END $$;

-- Insert users (skip existing)
INSERT INTO public.users (uid, email, full_name, avatar_url, created_at, updated_at)
SELECT uid, email, full_name, avatar_url, created_at, updated_at
FROM old_db.users old
WHERE NOT EXISTS (
    SELECT 1 FROM public.users new WHERE new.uid = old.uid
);

-- Verify users migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_db.users;
    SELECT COUNT(*) INTO new_count FROM public.users;
    RAISE NOTICE 'Users migrated: % in old DB, % in new DB', old_count, new_count;
END $$;


-- 2. Migrate Audio Files
INSERT INTO public.audio_files (
    id, uid, original_filename, file_path, file_size_bytes,
    mime_type, public_url, status, created_at, updated_at
)
SELECT 
    id, uid, original_filename, file_path, file_size_bytes,
    mime_type, public_url, status, created_at, updated_at
FROM old_db.audio_files old
WHERE NOT EXISTS (
    SELECT 1 FROM public.audio_files new WHERE new.id = old.id
);

-- Verify audio files migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_db.audio_files;
    SELECT COUNT(*) INTO new_count FROM public.audio_files;
    RAISE NOTICE 'Audio files migrated: % in old DB, % in new DB', old_count, new_count;
END $$;


-- 3. Migrate Transcripts (with all new columns)
INSERT INTO public.transcripts (
    id, audio_file_id, uid, content, language, word_count,
    processing_time_ms, model_used, cost_estimate_usd,
    created_at, updated_at
)
SELECT 
    id, audio_file_id, uid, content, language, word_count,
    -- Use default values for new columns if they don't exist in old DB
    COALESCE(processing_time_ms, NULL),
    COALESCE(model_used, 'whisper-1'),
    COALESCE(cost_estimate_usd, NULL),
    created_at, updated_at
FROM old_db.transcripts old
WHERE NOT EXISTS (
    SELECT 1 FROM public.transcripts new WHERE new.id = old.id
);

-- Verify transcripts migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_db.transcripts;
    SELECT COUNT(*) INTO new_count FROM public.transcripts;
    RAISE NOTICE 'Transcripts migrated: % in old DB, % in new DB', old_count, new_count;
END $$;


-- 4. Migrate Learning Content
INSERT INTO public.learning_content (
    id, uid, audio_file_id, content, created_at, updated_at
)
SELECT 
    id, uid, audio_file_id, content, created_at, updated_at
FROM old_db.learning_content old
WHERE NOT EXISTS (
    SELECT 1 FROM public.learning_content new WHERE new.id = old.id
);

-- Verify learning content migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_db.learning_content;
    SELECT COUNT(*) INTO new_count FROM public.learning_content;
    RAISE NOTICE 'Learning content migrated: % in old DB, % in new DB', old_count, new_count;
END $$;


-- 5. Migrate User Usage
INSERT INTO public.user_usage (
    id, uid, plan, allowed_minutes, used_minutes,
    cycle_start, created_at, updated_at
)
SELECT 
    id, uid, plan, allowed_minutes, used_minutes,
    cycle_start, created_at, updated_at
FROM old_db.user_usage old
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_usage new WHERE new.uid = old.uid
);

-- Verify user usage migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_db.user_usage;
    SELECT COUNT(*) INTO new_count FROM public.user_usage;
    RAISE NOTICE 'User usage records migrated: % in old DB, % in new DB', old_count, new_count;
END $$;


-- 6. Migrate User Cost Tracking (if it exists in old DB)
INSERT INTO public.user_cost_tracking (
    id, uid, total_cost_usd, monthly_cost_usd,
    api_calls_count, monthly_api_calls, last_api_call,
    cycle_start, created_at, updated_at
)
SELECT 
    id, uid, total_cost_usd, monthly_cost_usd,
    api_calls_count, monthly_api_calls, last_api_call,
    cycle_start, created_at, updated_at
FROM old_db.user_cost_tracking old
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_cost_tracking new WHERE new.uid = old.uid
);

-- Verify cost tracking migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_db.user_cost_tracking;
    SELECT COUNT(*) INTO new_count FROM public.user_cost_tracking;
    RAISE NOTICE 'Cost tracking records migrated: % in old DB, % in new DB', old_count, new_count;
END $$;


-- 7. Migrate Cost Log (if it exists in old DB)
INSERT INTO public.cost_log (
    id, uid, cost_usd, service, reference_id, metadata, created_at
)
SELECT 
    id, uid, cost_usd, service, reference_id, metadata, created_at
FROM old_db.cost_log old
WHERE NOT EXISTS (
    SELECT 1 FROM public.cost_log new WHERE new.id = old.id
);

-- Verify cost log migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_db.cost_log;
    SELECT COUNT(*) INTO new_count FROM public.cost_log;
    RAISE NOTICE 'Cost log entries migrated: % in old DB, % in new DB', old_count, new_count;
END $$;


-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Summary of all migrated data
SELECT 
    'MIGRATION SUMMARY' as summary,
    'Table' as table_name,
    'Old DB Count' as old_count,
    'New DB Count' as new_count,
    'Status' as status
UNION ALL
SELECT 
    '',
    'users',
    (SELECT COUNT(*)::text FROM old_db.users),
    (SELECT COUNT(*)::text FROM public.users),
    CASE 
        WHEN (SELECT COUNT(*) FROM old_db.users) = (SELECT COUNT(*) FROM public.users) 
        THEN '✅ Match'
        ELSE '⚠️ Mismatch'
    END
UNION ALL
SELECT 
    '',
    'audio_files',
    (SELECT COUNT(*)::text FROM old_db.audio_files),
    (SELECT COUNT(*)::text FROM public.audio_files),
    CASE 
        WHEN (SELECT COUNT(*) FROM old_db.audio_files) = (SELECT COUNT(*) FROM public.audio_files) 
        THEN '✅ Match'
        ELSE '⚠️ Mismatch'
    END
UNION ALL
SELECT 
    '',
    'transcripts',
    (SELECT COUNT(*)::text FROM old_db.transcripts),
    (SELECT COUNT(*)::text FROM public.transcripts),
    CASE 
        WHEN (SELECT COUNT(*) FROM old_db.transcripts) = (SELECT COUNT(*) FROM public.transcripts) 
        THEN '✅ Match'
        ELSE '⚠️ Mismatch'
    END
UNION ALL
SELECT 
    '',
    'learning_content',
    (SELECT COUNT(*)::text FROM old_db.learning_content),
    (SELECT COUNT(*)::text FROM public.learning_content),
    CASE 
        WHEN (SELECT COUNT(*) FROM old_db.learning_content) = (SELECT COUNT(*) FROM public.learning_content) 
        THEN '✅ Match'
        ELSE '⚠️ Mismatch'
    END
UNION ALL
SELECT 
    '',
    'user_usage',
    (SELECT COUNT(*)::text FROM old_db.user_usage),
    (SELECT COUNT(*)::text FROM public.user_usage),
    CASE 
        WHEN (SELECT COUNT(*) FROM old_db.user_usage) = (SELECT COUNT(*) FROM public.user_usage) 
        THEN '✅ Match'
        ELSE '⚠️ Mismatch'
    END;


-- ============================================================================
-- CLEANUP (Optional - run after verifying successful migration)
-- ============================================================================

-- Uncomment these lines after confirming successful migration:

-- DROP SCHEMA IF EXISTS old_db CASCADE;
-- DROP USER MAPPING IF EXISTS FOR postgres SERVER old_voiceframe_db;
-- DROP SERVER IF EXISTS old_voiceframe_db CASCADE;


-- ============================================================================
-- STORAGE FILES MIGRATION
-- ============================================================================
-- 
-- Note: Audio files in Supabase Storage need to be migrated separately.
-- 
-- Method 1: Using Supabase CLI (Recommended)
-- ```bash
-- # Install Supabase CLI if not already installed
-- npm install -g supabase
-- 
-- # Login to old project
-- supabase login
-- 
-- # Download all files from old bucket
-- mkdir -p ./audio_backup
-- supabase storage download audio-files --project-ref [OLD_PROJECT_REF] --recursive ./audio_backup
-- 
-- # Upload to new project
-- supabase storage upload audio-files ./audio_backup/* --project-ref [NEW_PROJECT_REF]
-- ```
-- 
-- Method 2: Using a migration script (for large datasets)
-- Create a Node.js script to download from old storage and upload to new storage:
-- 
-- ```javascript
-- const { createClient } = require('@supabase/supabase-js');
-- 
-- const oldSupabase = createClient(OLD_URL, OLD_SERVICE_KEY);
-- const newSupabase = createClient(NEW_URL, NEW_SERVICE_KEY);
-- 
-- async function migrateStorageFiles() {
--   const { data: files } = await oldSupabase.storage
--     .from('audio-files')
--     .list('', { limit: 1000, offset: 0 });
--   
--   for (const file of files) {
--     const { data: fileData } = await oldSupabase.storage
--       .from('audio-files')
--       .download(file.name);
--     
--     await newSupabase.storage
--       .from('audio-files')
--       .upload(file.name, fileData);
--   }
-- }
-- ```
-- 
-- ============================================================================


-- ============================================================================
-- POST-MIGRATION CHECKLIST
-- ============================================================================
-- 
-- [ ] All database tables migrated successfully
-- [ ] Row counts match between old and new databases
-- [ ] Storage files migrated (audio files)
-- [ ] Application tested with new database
-- [ ] Users can login and access their data
-- [ ] Audio playback works correctly
-- [ ] Transcripts are accessible
-- [ ] Foreign data wrapper cleaned up (if used)
-- [ ] Old database access can be revoked
-- [ ] Environment variables updated in production
-- [ ] Old Supabase project can be deleted (after backup)
-- 
-- ============================================================================

