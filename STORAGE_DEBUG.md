# Audio File Storage Debugging

## Issue

Getting 400 errors when trying to download audio files for transcription:

```
❌ Failed to download audio file: 400
POST /api/audio/transcribe/stream 500 in 1439ms
```

## Fixed Implementation

### 1. **Storage Access Issue**

The problem was that we were trying to access audio files via `public_url` directly, but Supabase Storage buckets might not be public or require authentication.

### 2. **New Solution**

Created `src/lib/storage-utils.ts` with proper Supabase Storage API usage:

- **Direct Download**: Uses `supabaseAdmin.storage.download()`
- **Signed URLs**: Fallback with temporary authenticated URLs
- **Enhanced Debugging**: Detailed logging for troubleshooting

### 3. **Updated Endpoints**

- `/api/audio/transcribe/route.ts` - Updated to use new storage utils
- `/api/audio/transcribe/stream/route.ts` - Updated to use new storage utils
- `/api/audio/[id]/debug/route.ts` - New debug endpoint

## Testing the Fix

### 1. Test Basic Audio Access

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/audio/YOUR_AUDIO_ID/debug
```

This will show:

- Audio file metadata
- Bucket access status
- Folder contents
- Download test results

### 2. Test Transcription

Try transcription again and check logs for detailed debug info.

## Potential Issues & Solutions

### Issue: Bucket Permissions

**Symptoms**: Download fails with permission errors
**Solution**:

- Check Supabase Storage bucket policies
- Ensure `audio-files` bucket exists
- Verify service role has access

### Issue: File Path Mismatch

**Symptoms**: File not found errors
**Solution**:

- Check `file_path` vs actual storage structure
- Use debug endpoint to see actual folder contents

### Issue: CORS or Network

**Symptoms**: Fetch fails on signed URLs
**Solution**:

- Check Supabase CORS settings
- Verify network connectivity

## Supabase Storage Setup

Make sure your `audio-files` bucket has proper configuration:

1. **Create Bucket** (if not exists):

   ```sql
   -- In Supabase SQL editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('audio-files', 'audio-files', false);
   ```

2. **Set Policies** (if needed):
   ```sql
   -- Allow service role to access all files
   CREATE POLICY "Service role can access audio files" ON storage.objects
   FOR ALL USING (bucket_id = 'audio-files' AND auth.role() = 'service_role');
   ```

## Debug Checklist

- [ ] Bucket `audio-files` exists in Supabase
- [ ] Service role key has proper permissions
- [ ] Files were uploaded correctly with proper paths
- [ ] Network connectivity to Supabase Storage
- [ ] Debug endpoint returns file info correctly
- [ ] Storage download works in debug endpoint

## Next Steps

1. Run the debug endpoint first
2. Check the detailed logs in console
3. Fix any storage configuration issues
4. Test transcription again

The new implementation should handle all common storage access patterns and provide clear error messages for debugging.
