-- Migration to add transcription tracking columns
-- Run this in Supabase SQL editor

-- Add columns for transcription tracking and cost monitoring
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS model_used TEXT DEFAULT 'whisper-1',
ADD COLUMN IF NOT EXISTS cost_estimate_usd DECIMAL(10, 6);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_transcripts_model_used ON transcripts(model_used);
CREATE INDEX IF NOT EXISTS idx_transcripts_audio_file_uid ON transcripts(audio_file_id, uid);

-- Add comments for documentation
COMMENT ON COLUMN transcripts.processing_time_ms IS 'Time taken to process transcription in milliseconds';
COMMENT ON COLUMN transcripts.model_used IS 'OpenAI model used for transcription (whisper-1, gpt-4o-transcribe, etc.)';
COMMENT ON COLUMN transcripts.cost_estimate_usd IS 'Estimated cost in USD for the transcription';