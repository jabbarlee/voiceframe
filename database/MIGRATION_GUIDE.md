# VoiceFrame Database Migration Guide

This guide provides comprehensive instructions for migrating your VoiceFrame application database to a new Supabase account.

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Migration Process](#migration-process)
- [Post-Migration Verification](#post-migration-verification)
- [Troubleshooting](#troubleshooting)
- [Database Schema Reference](#database-schema-reference)

---

## Overview

The `complete_migration.sql` file contains everything needed to set up your VoiceFrame database in a new Supabase project, including:

- **7 Database Tables**: users, audio_files, transcripts, learning_content, user_usage, user_cost_tracking, cost_log
- **PostgreSQL Extensions**: uuid-ossp, pgcrypto
- **Utility Functions**: Automatic timestamp updates
- **20+ Indexes**: Optimized for query performance
- **6 Triggers**: Automatic timestamp management
- **30+ RLS Policies**: Row-level security for all tables
- **1 Storage Bucket**: Private audio files storage with policies

---

## Pre-Migration Checklist

### 1. Create New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: VoiceFrame (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

### 2. Gather Required Credentials

After project creation, collect these values from your Supabase project settings:

**Project Settings > API**:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key (⚠️ Keep this secure!)

### 3. Backup Existing Data (If Applicable)

If you're migrating from an existing database:

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or using pg_dump directly
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" > backup.sql
```

---

## Migration Process

### Step 1: Run the Migration Script

1. **Open Supabase SQL Editor**:
   - Go to your new Supabase project
   - Navigate to "SQL Editor" in the left sidebar

2. **Load the Migration File**:
   - Click "New Query"
   - Copy the entire contents of `complete_migration.sql`
   - Paste into the SQL editor

3. **Execute the Script**:
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for completion (should take 5-10 seconds)
   - Check for any errors in the output

### Step 2: Verify Database Objects

Run these verification queries in the SQL editor:

```sql
-- Check all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected output: 7 tables
-- audio_files, cost_log, learning_content, transcripts, 
-- user_cost_tracking, user_usage, users
```

```sql
-- Check storage bucket
SELECT id, name, public, file_size_limit 
FROM storage.buckets;

-- Expected: 1 bucket named 'audio-files'
```

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- All tables should have rowsecurity = true
```

### Step 3: Update Application Environment Variables

Update your `.env.local` file with the new credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep your existing Firebase and OpenAI keys
NEXT_PUBLIC_FIREBASE_API_KEY=...
OPENAI_API_KEY=...
```

### Step 4: Test the Migration

Run these tests to ensure everything works:

#### Test 1: Basic Database Connection
```bash
# Start your development server
npm run dev

# Visit the test endpoint
curl http://localhost:3000/api/test/supabase
```

Expected response: `{ success: true, ... }`

#### Test 2: User Creation
Create a test user through your signup flow:
- Visit `/signup`
- Create a new account
- Check Supabase Dashboard > Database > users table

#### Test 3: Audio Upload
1. Login with test user
2. Upload a small audio file
3. Verify in Supabase Dashboard:
   - Storage > audio-files bucket (file should be there)
   - Database > audio_files table (metadata should be there)

#### Test 4: Transcription
1. Upload and transcribe an audio file
2. Verify in Database:
   - `transcripts` table has the transcription
   - `user_cost_tracking` table is updated
   - `cost_log` table has an entry

---

## Post-Migration Verification

### Check All Tables Have Data Constraints

```sql
-- Verify foreign keys
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

### Verify Indexes Are Created

```sql
-- List all indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Should see 20+ indexes
```

### Check RLS Policies

```sql
-- View all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should see 30+ policies
```

---

## Troubleshooting

### Issue: "Extension uuid-ossp does not exist"

**Solution**: The migration script should create this automatically. If it fails:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: "Permission denied for schema public"

**Solution**: Make sure you're running the script as a Supabase admin user (default in SQL Editor).

### Issue: Storage bucket policies not working

**Solution**: Verify the storage policies:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'audio-files';
```

If empty, the storage policies might not have been created. Check the Supabase Storage dashboard and manually add policies if needed.

### Issue: RLS blocking service role queries

**Solution**: Service role should bypass RLS. Verify you're using `SUPABASE_SERVICE_ROLE_KEY` in your backend code:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← Must be service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### Issue: Triggers not firing

**Solution**: Check if triggers exist:
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

---

## Database Schema Reference

### Table: `users`
Core user information synced with Firebase Auth.

| Column | Type | Description |
|--------|------|-------------|
| uid | TEXT (PK) | Firebase Authentication UID |
| email | TEXT | User email (unique) |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | Profile picture URL |
| created_at | TIMESTAMPTZ | Account creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### Table: `audio_files`
Metadata for uploaded audio files stored in Supabase Storage.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique file ID |
| uid | TEXT (FK) | Owner's Firebase UID |
| original_filename | TEXT | Original uploaded filename |
| file_path | TEXT | Path in storage bucket |
| file_size_bytes | BIGINT | File size in bytes |
| mime_type | TEXT | Audio MIME type |
| public_url | TEXT | Public URL (if applicable) |
| status | TEXT | uploaded/processing/completed/failed |
| created_at | TIMESTAMPTZ | Upload time |
| updated_at | TIMESTAMPTZ | Last update time |

### Table: `transcripts`
Audio transcription results from OpenAI Whisper API.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique transcript ID |
| audio_file_id | UUID (FK) | Reference to audio file |
| uid | TEXT (FK) | Owner's Firebase UID |
| content | TEXT | Transcribed text |
| language | TEXT | Language code (default: 'en') |
| word_count | INTEGER | Number of words |
| processing_time_ms | INTEGER | Processing time in ms |
| model_used | TEXT | OpenAI model used |
| cost_estimate_usd | DECIMAL(10,6) | Estimated cost |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### Table: `learning_content`
AI-generated learning materials from transcripts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique content ID |
| uid | TEXT (FK) | Owner's Firebase UID |
| audio_file_id | UUID (FK) | Reference to audio file |
| content | JSONB | Generated content (JSON) |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Constraint**: One learning content per audio file per user.

### Table: `user_usage`
Track monthly audio processing usage per user.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique record ID |
| uid | TEXT (FK) | User's Firebase UID |
| plan | TEXT | Subscription plan (free/starter/pro) |
| allowed_minutes | INTEGER | Monthly limit in minutes |
| used_minutes | INTEGER | Minutes consumed this cycle |
| cycle_start | TIMESTAMPTZ | Billing cycle start date |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Constraint**: One usage record per user.

### Table: `user_cost_tracking`
Track API usage costs per user with monthly cycles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique record ID |
| uid | TEXT (FK) | User's Firebase UID |
| total_cost_usd | DECIMAL(10,6) | Lifetime total cost |
| monthly_cost_usd | DECIMAL(10,6) | Current month cost |
| api_calls_count | INTEGER | Total API calls |
| monthly_api_calls | INTEGER | Current month API calls |
| last_api_call | TIMESTAMPTZ | Last API call timestamp |
| cycle_start | TIMESTAMPTZ | Billing cycle start |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Constraint**: One cost tracking record per user.

### Table: `cost_log`
Detailed audit log of all API costs and usage.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique log entry ID |
| uid | TEXT (FK) | User's Firebase UID |
| cost_usd | DECIMAL(10,6) | Cost for this operation |
| service | TEXT | Service type (transcription, etc.) |
| reference_id | UUID | Related record ID |
| metadata | JSONB | Additional details (JSON) |
| created_at | TIMESTAMPTZ | Log entry time |

### Storage Bucket: `audio-files`

**Configuration**:
- **Public**: No (requires authentication)
- **File Size Limit**: 100MB
- **Allowed MIME Types**: 
  - audio/mpeg
  - audio/mp3
  - audio/wav
  - audio/m4a
  - audio/aac
  - audio/ogg
  - audio/webm

**File Path Structure**: `{uid}/{timestamp}-{uuid}.{extension}`

Example: `abc123/1699123456789-550e8400-e29b-41d4-a716-446655440000.mp3`

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] New Supabase project created
- [ ] Credentials collected and saved securely
- [ ] `complete_migration.sql` executed successfully
- [ ] All 7 tables verified in Database dashboard
- [ ] Storage bucket `audio-files` created and verified
- [ ] RLS enabled on all tables
- [ ] Environment variables updated in `.env.local`
- [ ] Application successfully connects to new database
- [ ] Test user created successfully
- [ ] Audio file upload tested and working
- [ ] Transcription tested and working
- [ ] Cost tracking verified in database
- [ ] Old database backed up (if applicable)
- [ ] Data migrated from old database (if applicable)

---

## Support & Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Storage Guide**: https://supabase.com/docs/guides/storage
- **RLS Policies Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **VoiceFrame Repository**: Check your repository for additional documentation

---

## Security Best Practices

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Use Service Role Key carefully**: Only use in backend/server-side code
3. **Review RLS policies**: Ensure users can only access their own data
4. **Enable MFA**: On your Supabase account
5. **Regular backups**: Set up automated backups in Supabase dashboard
6. **Monitor usage**: Check Supabase dashboard regularly for unusual activity
7. **Keep dependencies updated**: Regularly update `@supabase/supabase-js`

---

**Migration Version**: 1.0.0  
**Last Updated**: November 2025  
**Compatibility**: Supabase v2.x, PostgreSQL 15+

