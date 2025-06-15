CREATE TABLE public.users (
    uid TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio files table - Store uploaded audio file metadata
CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    public_url TEXT,
    status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio files indexes
CREATE INDEX IF NOT EXISTS idx_audio_files_uid ON audio_files(uid);
CREATE INDEX IF NOT EXISTS idx_audio_files_status ON audio_files(status);
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON audio_files(created_at);

-- Add trigger for audio_files
DROP TRIGGER IF EXISTS update_audio_files_updated_at ON audio_files;
CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();