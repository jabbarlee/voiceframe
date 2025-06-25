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

create table transcripts (
  id uuid primary key default gen_random_uuid(),
  audio_file_id uuid not null references audio_files(id) on delete cascade,
  uid text not null references users(uid) on delete cascade,

  content text not null,
  language text default 'en',
  word_count int,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table learning_content (
  id uuid primary key default gen_random_uuid(),
  uid text not null references users(uid) on delete cascade,
  audio_file_id uuid not null references audio_files(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one learning content per audio file per user
  UNIQUE(audio_file_id, uid)
);

create table user_usage (
  id uuid primary key default gen_random_uuid(),

  uid text references public.users(uid) on delete cascade, -- Firebase user ID

  plan text not null default 'free', -- 'free', 'starter', 'pro', etc.

  allowed_minutes integer not null default 30, -- total monthly limit
  used_minutes integer not null default 0,     -- consumed so far

  cycle_start timestamp with time zone not null default date_trunc('month', now()),

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);


-- Add indexes for learning_content
CREATE INDEX IF NOT EXISTS idx_learning_content_uid ON learning_content(uid);
CREATE INDEX IF NOT EXISTS idx_learning_content_audio_file_id ON learning_content(audio_file_id);

-- Audio files indexes
CREATE INDEX IF NOT EXISTS idx_audio_files_uid ON audio_files(uid);
CREATE INDEX IF NOT EXISTS idx_audio_files_status ON audio_files(status);
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON audio_files(created_at);

-- Add trigger for audio_files
DROP TRIGGER IF EXISTS update_audio_files_updated_at ON audio_files;
CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();