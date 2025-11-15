-- Migration to add cost tracking tables
-- Run this in Supabase SQL editor

-- Create cost tracking table for users
CREATE TABLE IF NOT EXISTS user_cost_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
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

-- Create detailed cost log table for audit trail
CREATE TABLE IF NOT EXISTS cost_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    cost_usd DECIMAL(10, 6) NOT NULL,
    service TEXT NOT NULL, -- 'transcription', 'translation', etc.
    reference_id UUID, -- Link to transcript, content, etc.
    metadata JSONB, -- Store additional details like model used, duration, etc.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_cost_tracking_uid ON user_cost_tracking(uid);
CREATE INDEX IF NOT EXISTS idx_cost_log_uid ON cost_log(uid);
CREATE INDEX IF NOT EXISTS idx_cost_log_created_at ON cost_log(created_at);
CREATE INDEX IF NOT EXISTS idx_cost_log_service ON cost_log(service);
CREATE INDEX IF NOT EXISTS idx_cost_log_reference_id ON cost_log(reference_id);

-- Add comments for documentation
COMMENT ON TABLE user_cost_tracking IS 'Track API usage costs per user with monthly cycles';
COMMENT ON TABLE cost_log IS 'Detailed audit log of all API costs and usage';

COMMENT ON COLUMN user_cost_tracking.total_cost_usd IS 'Total lifetime cost for this user';
COMMENT ON COLUMN user_cost_tracking.monthly_cost_usd IS 'Cost for current monthly billing cycle';
COMMENT ON COLUMN user_cost_tracking.api_calls_count IS 'Total API calls made by user';
COMMENT ON COLUMN user_cost_tracking.monthly_api_calls IS 'API calls in current monthly cycle';
COMMENT ON COLUMN user_cost_tracking.cycle_start IS 'Start of current billing cycle';

COMMENT ON COLUMN cost_log.cost_usd IS 'Cost in USD for this specific API call';
COMMENT ON COLUMN cost_log.service IS 'Type of service: transcription, translation, etc.';
COMMENT ON COLUMN cost_log.reference_id IS 'ID of related record (transcript, etc.)';
COMMENT ON COLUMN cost_log.metadata IS 'Additional details: model, duration, tokens, etc.';

-- Add RLS (Row Level Security) policies
ALTER TABLE user_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cost data
CREATE POLICY "Users can view own cost tracking" ON user_cost_tracking
    FOR SELECT USING (auth.uid()::text = uid);

CREATE POLICY "Users can view own cost log" ON cost_log
    FOR SELECT USING (auth.uid()::text = uid);

-- Only service role can modify cost data (for security)
CREATE POLICY "Service role can manage cost tracking" ON user_cost_tracking
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage cost log" ON cost_log
    FOR ALL USING (auth.role() = 'service_role');