-- ============================================================================
-- VOICEFRAME - Complete Database Migration Script
-- ============================================================================
-- This script creates a complete database schema for a new Supabase account
-- including all tables, indexes, triggers, RLS policies, and storage buckets.
--
-- USAGE:
-- 1. Run this script in your new Supabase project's SQL Editor
-- 2. Verify all tables, functions, and policies are created
-- 3. Update your environment variables with the new Supabase credentials
-- ============================================================================

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional crypto functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- 2. CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 3. CREATE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users Table - Core user information (synced with Firebase Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    uid TEXT PRIMARY KEY,                    -- Firebase UID
    email TEXT NOT NULL UNIQUE,              -- User email
    full_name TEXT,                          -- User's full name
    avatar_url TEXT,                         -- Profile picture URL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Core user information synced with Firebase Authentication';
COMMENT ON COLUMN public.users.uid IS 'Firebase Authentication user ID';
COMMENT ON COLUMN public.users.email IS 'User email address (unique)';


-- ----------------------------------------------------------------------------
-- Audio Files Table - Metadata for uploaded audio files
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,                -- Path in Supabase Storage
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    public_url TEXT,                        -- Public URL if bucket is public
    status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.audio_files IS 'Metadata for uploaded audio files stored in Supabase Storage';
COMMENT ON COLUMN public.audio_files.file_path IS 'Relative path in the audio-files storage bucket';
COMMENT ON COLUMN public.audio_files.status IS 'Processing status: uploaded, processing, completed, or failed';


-- ----------------------------------------------------------------------------
-- Transcripts Table - Audio transcription results
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_file_id UUID NOT NULL REFERENCES public.audio_files(id) ON DELETE CASCADE,
    uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    content TEXT NOT NULL,                  -- Transcribed text
    language TEXT DEFAULT 'en',             -- Language code (e.g., 'en', 'es')
    word_count INTEGER,                     -- Number of words in transcript
    processing_time_ms INTEGER,             -- Time taken to process (milliseconds)
    model_used TEXT DEFAULT 'whisper-1',    -- OpenAI model used
    cost_estimate_usd DECIMAL(10, 6),       -- Estimated cost for transcription
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.transcripts IS 'Audio transcription results from OpenAI Whisper API';
COMMENT ON COLUMN public.transcripts.processing_time_ms IS 'Time taken to process transcription in milliseconds';
COMMENT ON COLUMN public.transcripts.model_used IS 'OpenAI model used (whisper-1, gpt-4o-transcribe, etc.)';
COMMENT ON COLUMN public.transcripts.cost_estimate_usd IS 'Estimated cost in USD for the transcription';


-- ----------------------------------------------------------------------------
-- Learning Content Table - Generated learning materials
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    audio_file_id UUID NOT NULL REFERENCES public.audio_files(id) ON DELETE CASCADE,
    content JSONB NOT NULL,                 -- Generated learning content (JSON format)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one learning content per audio file per user
    UNIQUE(audio_file_id, uid)
);

COMMENT ON TABLE public.learning_content IS 'AI-generated learning materials from transcripts';
COMMENT ON COLUMN public.learning_content.content IS 'JSONB containing generated content (summaries, questions, etc.)';


-- ----------------------------------------------------------------------------
-- User Usage Table - Track user's monthly usage limits
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free',      -- Subscription plan: 'free', 'starter', 'pro'
    allowed_minutes INTEGER NOT NULL DEFAULT 30,  -- Monthly limit
    used_minutes INTEGER NOT NULL DEFAULT 0,      -- Minutes consumed this cycle
    cycle_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one usage record per user
    UNIQUE(uid)
);

COMMENT ON TABLE public.user_usage IS 'Track monthly audio processing usage per user';
COMMENT ON COLUMN public.user_usage.plan IS 'Subscription plan level: free, starter, pro, etc.';
COMMENT ON COLUMN public.user_usage.allowed_minutes IS 'Total monthly limit in minutes';
COMMENT ON COLUMN public.user_usage.used_minutes IS 'Minutes consumed in current cycle';
COMMENT ON COLUMN public.user_usage.cycle_start IS 'Start of current billing cycle';


-- ----------------------------------------------------------------------------
-- User Cost Tracking Table - Track API costs per user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_cost_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    total_cost_usd DECIMAL(10, 6) DEFAULT 0 NOT NULL,
    monthly_cost_usd DECIMAL(10, 6) DEFAULT 0 NOT NULL,
    api_calls_count INTEGER DEFAULT 0 NOT NULL,
    monthly_api_calls INTEGER DEFAULT 0 NOT NULL,
    last_api_call TIMESTAMPTZ,
    cycle_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one record per user
    UNIQUE(uid)
);

COMMENT ON TABLE public.user_cost_tracking IS 'Track API usage costs per user with monthly cycles';
COMMENT ON COLUMN public.user_cost_tracking.total_cost_usd IS 'Total lifetime cost for this user';
COMMENT ON COLUMN public.user_cost_tracking.monthly_cost_usd IS 'Cost for current monthly billing cycle';
COMMENT ON COLUMN public.user_cost_tracking.api_calls_count IS 'Total API calls made by user';
COMMENT ON COLUMN public.user_cost_tracking.monthly_api_calls IS 'API calls in current monthly cycle';
COMMENT ON COLUMN public.user_cost_tracking.cycle_start IS 'Start of current billing cycle';


-- ----------------------------------------------------------------------------
-- Cost Log Table - Detailed audit trail of all API costs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cost_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    cost_usd DECIMAL(10, 6) NOT NULL,
    service TEXT NOT NULL,                  -- Service type: 'transcription', 'translation', etc.
    reference_id UUID,                      -- Link to transcript, content, etc.
    metadata JSONB,                         -- Additional details (model, duration, tokens)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.cost_log IS 'Detailed audit log of all API costs and usage';
COMMENT ON COLUMN public.cost_log.cost_usd IS 'Cost in USD for this specific API call';
COMMENT ON COLUMN public.cost_log.service IS 'Type of service: transcription, translation, etc.';
COMMENT ON COLUMN public.cost_log.reference_id IS 'ID of related record (transcript, etc.)';
COMMENT ON COLUMN public.cost_log.metadata IS 'Additional details: model, duration, tokens, etc.';


-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Audio files indexes
CREATE INDEX IF NOT EXISTS idx_audio_files_uid ON public.audio_files(uid);
CREATE INDEX IF NOT EXISTS idx_audio_files_status ON public.audio_files(status);
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON public.audio_files(created_at);

-- Transcripts indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_audio_file_id ON public.transcripts(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_uid ON public.transcripts(uid);
CREATE INDEX IF NOT EXISTS idx_transcripts_model_used ON public.transcripts(model_used);
CREATE INDEX IF NOT EXISTS idx_transcripts_audio_file_uid ON public.transcripts(audio_file_id, uid);

-- Learning content indexes
CREATE INDEX IF NOT EXISTS idx_learning_content_uid ON public.learning_content(uid);
CREATE INDEX IF NOT EXISTS idx_learning_content_audio_file_id ON public.learning_content(audio_file_id);

-- User usage indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_uid ON public.user_usage(uid);
CREATE INDEX IF NOT EXISTS idx_user_usage_plan ON public.user_usage(plan);

-- Cost tracking indexes
CREATE INDEX IF NOT EXISTS idx_user_cost_tracking_uid ON public.user_cost_tracking(uid);
CREATE INDEX IF NOT EXISTS idx_cost_log_uid ON public.cost_log(uid);
CREATE INDEX IF NOT EXISTS idx_cost_log_created_at ON public.cost_log(created_at);
CREATE INDEX IF NOT EXISTS idx_cost_log_service ON public.cost_log(service);
CREATE INDEX IF NOT EXISTS idx_cost_log_reference_id ON public.cost_log(reference_id);


-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Trigger to automatically update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on audio_files table
DROP TRIGGER IF EXISTS update_audio_files_updated_at ON public.audio_files;
CREATE TRIGGER update_audio_files_updated_at 
    BEFORE UPDATE ON public.audio_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on transcripts table
DROP TRIGGER IF EXISTS update_transcripts_updated_at ON public.transcripts;
CREATE TRIGGER update_transcripts_updated_at 
    BEFORE UPDATE ON public.transcripts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on learning_content table
DROP TRIGGER IF EXISTS update_learning_content_updated_at ON public.learning_content;
CREATE TRIGGER update_learning_content_updated_at 
    BEFORE UPDATE ON public.learning_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on user_usage table
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON public.user_usage;
CREATE TRIGGER update_user_usage_updated_at 
    BEFORE UPDATE ON public.user_usage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on user_cost_tracking table
DROP TRIGGER IF EXISTS update_user_cost_tracking_updated_at ON public.user_cost_tracking;
CREATE TRIGGER update_user_cost_tracking_updated_at 
    BEFORE UPDATE ON public.user_cost_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables: POSTPONED
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_cost_tracking ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.cost_log ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 7. CREATE RLS POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users Table Policies
-- ----------------------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = uid);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = uid);

-- Service role can manage all users
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');


-- ----------------------------------------------------------------------------
-- Audio Files Table Policies
-- ----------------------------------------------------------------------------

-- Users can view their own audio files
CREATE POLICY "Users can view own audio files" ON public.audio_files
    FOR SELECT USING (auth.uid()::text = uid);

-- Users can insert their own audio files
CREATE POLICY "Users can insert own audio files" ON public.audio_files
    FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Users can update their own audio files
CREATE POLICY "Users can update own audio files" ON public.audio_files
    FOR UPDATE USING (auth.uid()::text = uid);

-- Users can delete their own audio files
CREATE POLICY "Users can delete own audio files" ON public.audio_files
    FOR DELETE USING (auth.uid()::text = uid);

-- Service role can manage all audio files
CREATE POLICY "Service role can manage audio files" ON public.audio_files
    FOR ALL USING (auth.role() = 'service_role');


-- ----------------------------------------------------------------------------
-- Transcripts Table Policies
-- ----------------------------------------------------------------------------

-- Users can view their own transcripts
CREATE POLICY "Users can view own transcripts" ON public.transcripts
    FOR SELECT USING (auth.uid()::text = uid);

-- Users can insert their own transcripts
CREATE POLICY "Users can insert own transcripts" ON public.transcripts
    FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Users can update their own transcripts
CREATE POLICY "Users can update own transcripts" ON public.transcripts
    FOR UPDATE USING (auth.uid()::text = uid);

-- Users can delete their own transcripts
CREATE POLICY "Users can delete own transcripts" ON public.transcripts
    FOR DELETE USING (auth.uid()::text = uid);

-- Service role can manage all transcripts
CREATE POLICY "Service role can manage transcripts" ON public.transcripts
    FOR ALL USING (auth.role() = 'service_role');


-- ----------------------------------------------------------------------------
-- Learning Content Table Policies
-- ----------------------------------------------------------------------------

-- Users can view their own learning content
CREATE POLICY "Users can view own learning content" ON public.learning_content
    FOR SELECT USING (auth.uid()::text = uid);

-- Users can insert their own learning content
CREATE POLICY "Users can insert own learning content" ON public.learning_content
    FOR INSERT WITH CHECK (auth.uid()::text = uid);

-- Users can update their own learning content
CREATE POLICY "Users can update own learning content" ON public.learning_content
    FOR UPDATE USING (auth.uid()::text = uid);

-- Users can delete their own learning content
CREATE POLICY "Users can delete own learning content" ON public.learning_content
    FOR DELETE USING (auth.uid()::text = uid);

-- Service role can manage all learning content
CREATE POLICY "Service role can manage learning content" ON public.learning_content
    FOR ALL USING (auth.role() = 'service_role');


-- ----------------------------------------------------------------------------
-- User Usage Table Policies
-- ----------------------------------------------------------------------------

-- Users can view their own usage data
CREATE POLICY "Users can view own usage" ON public.user_usage
    FOR SELECT USING (auth.uid()::text = uid);

-- Service role can manage all usage data
CREATE POLICY "Service role can manage usage" ON public.user_usage
    FOR ALL USING (auth.role() = 'service_role');


-- ----------------------------------------------------------------------------
-- Cost Tracking Table Policies
-- ----------------------------------------------------------------------------

-- Users can only see their own cost data
CREATE POLICY "Users can view own cost tracking" ON public.user_cost_tracking
    FOR SELECT USING (auth.uid()::text = uid);

-- Only service role can modify cost data (for security)
CREATE POLICY "Service role can manage cost tracking" ON public.user_cost_tracking
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own cost log
CREATE POLICY "Users can view own cost log" ON public.cost_log
    FOR SELECT USING (auth.uid()::text = uid);

-- Service role can manage cost log
CREATE POLICY "Service role can manage cost log" ON public.cost_log
    FOR ALL USING (auth.role() = 'service_role');


-- ============================================================================
-- 8. STORAGE BUCKETS CONFIGURATION
-- ============================================================================

-- Create audio-files bucket (private bucket for security)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio-files',
    'audio-files',
    false,  -- Private bucket - requires authentication
    104857600,  -- 100MB file size limit
    ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 9. STORAGE BUCKET RLS POLICIES
-- ============================================================================

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload own audio files" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'audio-files' 
        AND (auth.uid()::text) = (storage.foldername(name))[1]
    );

-- Allow users to read their own files
CREATE POLICY "Users can read own audio files" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'audio-files' 
        AND (auth.uid()::text) = (storage.foldername(name))[1]
    );

-- Allow users to update their own files
CREATE POLICY "Users can update own audio files" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'audio-files' 
        AND (auth.uid()::text) = (storage.foldername(name))[1]
    );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own audio files" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'audio-files' 
        AND (auth.uid()::text) = (storage.foldername(name))[1]
    );

-- Service role can access all files in the bucket
CREATE POLICY "Service role can access all audio files" ON storage.objects
    FOR ALL 
    USING (
        bucket_id = 'audio-files' 
        AND auth.role() = 'service_role'
    );


-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these queries to verify the migration was successful:

-- SELECT 'Tables Created:' as status;
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
-- ORDER BY table_name;

-- SELECT 'Indexes Created:' as status;
-- SELECT indexname FROM pg_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY indexname;

-- SELECT 'Triggers Created:' as status;
-- SELECT trigger_name, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

-- SELECT 'RLS Policies:' as status;
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- SELECT 'Storage Buckets:' as status;
-- SELECT id, name, public, file_size_limit FROM storage.buckets;


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- NEXT STEPS:
-- 
-- 1. Verify all tables are created:
--    Check the Supabase Dashboard > Database > Tables
-- 
-- 2. Verify storage bucket:
--    Check the Supabase Dashboard > Storage > Buckets
-- 
-- 3. Update your application's environment variables:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY
-- 
-- 4. Test the migration:
--    - Try creating a user
--    - Upload an audio file
--    - Create a transcription
-- 
-- 5. Optional: Migrate existing data from old database
--    Use Supabase's export/import tools or pg_dump/pg_restore
-- 
-- ============================================================================

