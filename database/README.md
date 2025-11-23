# VoiceFrame Database Migration Files

Complete database migration toolkit for migrating VoiceFrame to a new Supabase account.

## 📁 Files Overview

### Primary Migration Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **`complete_migration.sql`** | Full database schema setup | ✅ **START HERE** - Run this first in new Supabase project |
| **`MIGRATION_GUIDE.md`** | Detailed migration instructions | Read this for step-by-step guidance |
| **`MIGRATION_QUICK_REFERENCE.md`** | One-page cheat sheet | Quick reference during migration |
| **`data_migration_template.sql`** | Migrate existing data | Use if you have data in an old database |
| **`rollback_migration.sql`** | Undo migration | Use if something goes wrong |

### Reference Files (Legacy)

| File | Purpose | Notes |
|------|---------|-------|
| `schema.sql` | Original base schema | Reference only - superseded by complete_migration.sql |
| `migration_cost_tracking.sql` | Cost tracking tables | Integrated into complete_migration.sql |
| `migration_transcription_columns.sql` | Transcript columns | Integrated into complete_migration.sql |

---

## 🚀 Quick Start

### New Supabase Project (Fresh Start)

```bash
# 1. Create new Supabase project at https://app.supabase.com

# 2. Open SQL Editor in new project

# 3. Run complete_migration.sql
#    Copy entire file contents and paste into SQL Editor
#    Click "Run"

# 4. Update .env.local with new credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# 5. Test connection
npm run dev
curl http://localhost:3000/api/test/supabase
```

✅ **Done!** You now have a fully configured VoiceFrame database.

---

### Migrating from Existing Supabase Project (With Data)

```bash
# 1. Create new Supabase project

# 2. Run complete_migration.sql in NEW project
#    (Sets up tables, indexes, policies, etc.)

# 3. Choose a data migration method:

# Option A: pg_dump (Recommended for production)
pg_dump "postgresql://postgres:[OLD_PASSWORD]@db.[OLD_REF].supabase.co:5432/postgres" \
  --data-only --table=public.users --table=public.audio_files \
  > data_export.sql

psql "postgresql://postgres:[NEW_PASSWORD]@db.[NEW_REF].supabase.co:5432/postgres" \
  < data_export.sql

# Option B: Foreign Data Wrapper (see data_migration_template.sql)

# Option C: Supabase Dashboard backup/restore

# 4. Migrate storage files (audio files)
# See data_migration_template.sql for methods

# 5. Verify and test thoroughly before switching production
```

---

## 📊 What Gets Created

### Database Objects

- **7 Tables**: All VoiceFrame data structures
- **2 Extensions**: UUID generation, crypto functions
- **1 Utility Function**: Auto-update timestamps
- **20+ Indexes**: Optimized query performance
- **6 Triggers**: Automatic timestamp management
- **30+ RLS Policies**: Secure row-level access control

### Storage

- **1 Bucket**: `audio-files` (private, 100MB limit)
- **5 Storage Policies**: User-scoped file access

### Security

- ✅ Row Level Security enabled on all tables
- ✅ Users can only access their own data
- ✅ Service role has full access for backend operations
- ✅ Storage files isolated by user ID

---

## 📖 Documentation Files

### MIGRATION_GUIDE.md
**Comprehensive 2000+ word guide covering:**
- Pre-migration checklist
- Step-by-step migration process
- Post-migration verification
- Troubleshooting common issues
- Database schema reference
- Security best practices

**Use when:** You need detailed explanations and context.

### MIGRATION_QUICK_REFERENCE.md
**One-page reference including:**
- 5-minute quick start
- Essential SQL queries
- Environment variables
- Schema diagrams
- Common commands
- Troubleshooting table

**Use when:** You need quick answers during migration.

---

## 🗃️ Database Schema

### Core Tables

```
users (7 columns)
├── uid (PK, TEXT) - Firebase UID
├── email (TEXT, UNIQUE)
├── full_name (TEXT)
├── avatar_url (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

audio_files (10 columns)
├── id (PK, UUID)
├── uid (FK → users.uid)
├── original_filename (TEXT)
├── file_path (TEXT) - Storage path
├── file_size_bytes (BIGINT)
├── mime_type (TEXT)
├── public_url (TEXT)
├── status (TEXT) - uploaded/processing/completed/failed
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

transcripts (11 columns)
├── id (PK, UUID)
├── audio_file_id (FK → audio_files.id)
├── uid (FK → users.uid)
├── content (TEXT) - Transcribed text
├── language (TEXT)
├── word_count (INTEGER)
├── processing_time_ms (INTEGER)
├── model_used (TEXT)
├── cost_estimate_usd (DECIMAL)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

learning_content (6 columns)
├── id (PK, UUID)
├── uid (FK → users.uid)
├── audio_file_id (FK → audio_files.id)
├── content (JSONB) - Generated content
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
└── UNIQUE(audio_file_id, uid)

user_usage (8 columns)
├── id (PK, UUID)
├── uid (FK → users.uid)
├── plan (TEXT) - free/starter/pro
├── allowed_minutes (INTEGER)
├── used_minutes (INTEGER)
├── cycle_start (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
└── UNIQUE(uid)

user_cost_tracking (10 columns)
├── id (PK, UUID)
├── uid (FK → users.uid)
├── total_cost_usd (DECIMAL)
├── monthly_cost_usd (DECIMAL)
├── api_calls_count (INTEGER)
├── monthly_api_calls (INTEGER)
├── last_api_call (TIMESTAMPTZ)
├── cycle_start (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
└── UNIQUE(uid)

cost_log (6 columns)
├── id (PK, UUID)
├── uid (FK → users.uid)
├── cost_usd (DECIMAL)
├── service (TEXT) - transcription/etc
├── reference_id (UUID)
├── metadata (JSONB)
└── created_at (TIMESTAMPTZ)
```

---

## 🔧 Verification Queries

### Check Migration Success

```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: 7 tables

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
-- All should have rowsecurity = true

-- Verify storage bucket
SELECT * FROM storage.buckets WHERE id = 'audio-files';
-- Should return 1 row

-- Count RLS policies
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Expected: 30+ policies

-- List all indexes
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
-- Expected: 20+ indexes

-- Check triggers
SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public';
-- Expected: 6 triggers
```

---

## 🔄 Migration Workflow

```
┌─────────────────────────────────────────────────────────┐
│  1. Create New Supabase Project                         │
│     https://app.supabase.com                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  2. Run complete_migration.sql                          │
│     • Creates 7 tables                                  │
│     • Sets up 30+ RLS policies                          │
│     • Creates storage bucket                            │
│     • Adds indexes and triggers                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  3. Verify Migration                                    │
│     Run verification queries                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  4. Update Environment Variables                        │
│     .env.local with new credentials                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  5. Test Application                                    │
│     • Test signup/login                                 │
│     • Test audio upload                                 │
│     • Test transcription                                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  6. Migrate Data (if applicable)                        │
│     Use data_migration_template.sql                     │
│     • Migrate database records                          │
│     • Migrate storage files                             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  7. Final Verification                                  │
│     • Check all data                                    │
│     • Test all features                                 │
│     • Verify user access                                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  8. Go Live!                                            │
│     Switch production to new database                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Migration Script Fails

**Check SQL Editor output for error messages**

Common issues:
- Extension not created → Re-run extension creation section
- Permission denied → Use Supabase SQL Editor (has admin rights)
- Table already exists → Safe to ignore if using `IF NOT EXISTS`

### RLS Blocking Queries

**Backend should use Service Role Key**

```typescript
// ✅ Correct - Service role bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role
);

// ❌ Wrong - Anon key respects RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Anon key
);
```

### Storage Upload Fails

**Check bucket exists and policies are correct**

```sql
-- Verify bucket
SELECT * FROM storage.buckets WHERE id = 'audio-files';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'audio-files';
```

### Data Migration Issues

**Use pg_dump method for reliability**

If foreign data wrapper fails, fall back to pg_dump/pg_restore method (most reliable).

---

## 🔒 Security Notes

### Environment Variables

```env
# ✅ Safe to commit (public)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ❌ NEVER commit (secret)
SUPABASE_SERVICE_ROLE_KEY=
```

### Service Role Key Usage

- ✅ Use in API routes (server-side)
- ✅ Use in server components
- ❌ Never use in client components
- ❌ Never expose to frontend

### RLS Policies

All tables have RLS enabled. Users can only:
- View their own data
- Modify their own data
- Cannot access other users' data

Service role bypasses RLS for administrative operations.

---

## 📞 Need Help?

1. **Check MIGRATION_GUIDE.md** for detailed instructions
2. **Check MIGRATION_QUICK_REFERENCE.md** for quick answers
3. **Supabase Docs**: https://supabase.com/docs
4. **Check Supabase Discord**: https://discord.supabase.com

---

## ✅ Migration Checklist

### Pre-Migration
- [ ] New Supabase project created
- [ ] Project credentials saved securely
- [ ] Existing data backed up (if migrating)
- [ ] Migration files reviewed

### Migration
- [ ] `complete_migration.sql` executed successfully
- [ ] All tables created (verified)
- [ ] All indexes created (verified)
- [ ] All triggers created (verified)
- [ ] All RLS policies created (verified)
- [ ] Storage bucket created (verified)
- [ ] No errors in SQL output

### Configuration
- [ ] `.env.local` updated with new credentials
- [ ] Service role key is secure
- [ ] Anon key is public-facing only

### Testing
- [ ] Database connection successful
- [ ] User signup works
- [ ] User login works
- [ ] Audio file upload works
- [ ] Audio files appear in storage
- [ ] Transcription works
- [ ] Generated content works
- [ ] Cost tracking updates correctly

### Data Migration (if applicable)
- [ ] Data migration method chosen
- [ ] Database records migrated
- [ ] Storage files migrated
- [ ] Data integrity verified
- [ ] Row counts match

### Go Live
- [ ] All features tested
- [ ] Production environment variables updated
- [ ] DNS/routing updated (if needed)
- [ ] Old database can be decommissioned
- [ ] Backup strategy in place

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Compatibility**: Supabase v2.x, PostgreSQL 15+  
**License**: Same as VoiceFrame project

