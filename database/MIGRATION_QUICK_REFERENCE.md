# VoiceFrame Migration Quick Reference

One-page reference for the database migration process.

## 🚀 Quick Start (5 Minutes)

### 1. Create New Supabase Project
```
1. Visit https://app.supabase.com
2. Click "New Project"
3. Name: VoiceFrame
4. Choose region & password
5. Wait ~2 minutes
```

### 2. Run Migration
```sql
-- In Supabase SQL Editor, paste and run:
-- File: database/complete_migration.sql
```

### 3. Update Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 4. Test
```bash
npm run dev
# Visit http://localhost:3000/api/test/supabase
```

✅ Done!

---

## 📊 What Gets Created

### Tables (7)
| Table | Purpose | Records |
|-------|---------|---------|
| `users` | User profiles (Firebase sync) | User data |
| `audio_files` | Audio file metadata | File info |
| `transcripts` | Transcription results | Transcribed text |
| `learning_content` | Generated learning materials | AI content |
| `user_usage` | Monthly usage tracking | Usage limits |
| `user_cost_tracking` | Cost monitoring | API costs |
| `cost_log` | Detailed cost audit trail | Cost entries |

### Storage (1)
- **Bucket**: `audio-files` (private, 100MB limit)
- **Allowed types**: mp3, wav, m4a, aac, ogg, webm

### Security
- ✅ RLS enabled on all tables
- ✅ 30+ row-level security policies
- ✅ Service role bypass for backend
- ✅ User-scoped file access

### Performance
- ✅ 20+ optimized indexes
- ✅ Automatic timestamp updates
- ✅ Foreign key constraints
- ✅ Unique constraints

---

## 🔧 Essential SQL Queries

### Verify Migration
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'audio-files';

-- Check RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### View Policies
```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

### Check Indexes
```sql
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';
```

---

## 🔐 Environment Variables Reference

### Required for Migration
```env
# Supabase (Get from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Firebase (Keep existing)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenAI (Keep existing)
OPENAI_API_KEY=
```

---

## 🗂️ Database Schema Quick View

### `users`
```sql
uid (PK) | email | full_name | avatar_url | created_at | updated_at
```

### `audio_files`
```sql
id (PK) | uid (FK) | original_filename | file_path | file_size_bytes 
mime_type | public_url | status | created_at | updated_at
```

### `transcripts`
```sql
id (PK) | audio_file_id (FK) | uid (FK) | content | language 
word_count | processing_time_ms | model_used | cost_estimate_usd 
created_at | updated_at
```

### `learning_content`
```sql
id (PK) | uid (FK) | audio_file_id (FK) | content (JSONB)
created_at | updated_at
UNIQUE(audio_file_id, uid)
```

### `user_usage`
```sql
id (PK) | uid (FK) | plan | allowed_minutes | used_minutes 
cycle_start | created_at | updated_at
UNIQUE(uid)
```

### `user_cost_tracking`
```sql
id (PK) | uid (FK) | total_cost_usd | monthly_cost_usd 
api_calls_count | monthly_api_calls | last_api_call 
cycle_start | created_at | updated_at
UNIQUE(uid)
```

### `cost_log`
```sql
id (PK) | uid (FK) | cost_usd | service | reference_id 
metadata (JSONB) | created_at
```

---

## 📁 File Structure

```
database/
├── complete_migration.sql          # 👈 Main migration script
├── MIGRATION_GUIDE.md              # 👈 Detailed guide
├── MIGRATION_QUICK_REFERENCE.md    # 👈 This file
├── rollback_migration.sql          # 👈 Undo migration
├── schema.sql                      # Original schema (reference)
├── migration_cost_tracking.sql     # Old migration (reference)
└── migration_transcription_columns.sql  # Old migration (reference)
```

---

## ⚡ Common Commands

### Test Database Connection
```bash
curl http://localhost:3000/api/test/supabase
```

### Test User Creation
```bash
# Via your app's signup page
# Or via API:
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

### Check Audio Upload
```bash
# Via your app's upload page
# File should appear in:
# - Supabase Storage > audio-files
# - Database > audio_files table
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| `Extension uuid-ossp does not exist` | Run: `CREATE EXTENSION "uuid-ossp";` |
| `Permission denied for schema public` | Use Supabase SQL Editor (auto-admin) |
| RLS blocking queries | Use `SUPABASE_SERVICE_ROLE_KEY` in backend |
| Storage upload fails | Check bucket exists: `SELECT * FROM storage.buckets` |
| Triggers not firing | Verify: `SELECT * FROM information_schema.triggers` |
| Can't see uploaded files | Check storage policies: `SELECT * FROM storage.policies` |

---

## 🔄 Rollback Process

If something goes wrong:

```sql
-- Run this in SQL Editor:
-- File: database/rollback_migration.sql
```

Then manually delete the storage bucket in dashboard.

---

## ✅ Migration Checklist

**Pre-Migration**
- [ ] New Supabase project created
- [ ] Credentials saved securely
- [ ] Existing data backed up (if applicable)

**Migration**
- [ ] `complete_migration.sql` executed
- [ ] No errors in SQL editor output
- [ ] 7 tables created
- [ ] Storage bucket created
- [ ] RLS enabled on all tables

**Post-Migration**
- [ ] Environment variables updated
- [ ] App connects to new database
- [ ] User signup works
- [ ] Audio upload works
- [ ] Transcription works

**Optional**
- [ ] Old data migrated
- [ ] Old database decommissioned

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide**: https://supabase.com/docs/guides/storage
- **Full Migration Guide**: See `MIGRATION_GUIDE.md`

---

## 🔒 Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] Service role key never in frontend
- [ ] RLS policies reviewed
- [ ] MFA enabled on Supabase account
- [ ] Backup strategy in place
- [ ] Regular security audits scheduled

---

**Version**: 1.0.0  
**Last Updated**: November 2025

