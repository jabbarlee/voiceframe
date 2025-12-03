# VoiceFrame — Presentation Cheat Sheet

## 🎯 One-Liner

> **VoiceFrame** transforms audio files into AI-generated learning content using OpenAI's Whisper + GPT-4o.

---

## 🔥 Problem → Solution

| Problem                                | Solution                                       |
| -------------------------------------- | ---------------------------------------------- |
| Manual transcription is tedious        | AI-powered auto-transcription                  |
| Hard to extract key info from audio    | Auto-generates summaries, flashcards, concepts |
| No quick study materials from lectures | Creates study packs instantly                  |

---

## 🚀 User Flow + API Endpoints

| Step | Action         | API Endpoint                 | What Happens                                                  |
| ---- | -------------- | ---------------------------- | ------------------------------------------------------------- |
| 1    | **Upload**     | `POST /api/audio/upload`     | Validate file → Check usage limits → Save to Supabase Storage |
| 2    | **Transcribe** | `POST /api/audio/transcribe` | Download file → Call Whisper API → Save transcript            |
| 3    | **Generate**   | `GET /api/content/[id]`      | Parallel GPT-4o calls → Summaries + Flashcards + Concepts     |
| 4    | **Download**   | `GET /api/content/[id]/pdf`  | Generate PDF from content                                     |

---

## 🛠️ Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS |
| **Auth**     | Firebase Authentication                       |
| **Database** | Supabase (PostgreSQL + Storage)               |
| **AI**       | OpenAI Whisper + GPT-4o                       |

---

## 🏗️ Architecture (Key Points)

- **Hybrid Auth**: Firebase handles login → User synced to Supabase DB
- **Serverless**: All backend logic lives in Next.js API routes
- **Row-Level Security**: Supabase enforces user can only see their own data
- **Parallel Processing**: `Promise.all()` for 3x faster content generation

---

## 📊 Database Tables

| Table              | Purpose                                 |
| ------------------ | --------------------------------------- |
| `users`            | User profiles (synced from Firebase)    |
| `audio_files`      | File metadata, status, storage path     |
| `transcripts`      | Transcript text, language, word count   |
| `learning_content` | Summaries, flashcards, concepts (JSONB) |
| `user_usage`       | Plan, allowed/used minutes              |

---

## 💡 Generated Content Types

| Type            | Description                             |
| --------------- | --------------------------------------- |
| **Summaries**   | 3 tones: Professional / Friendly / ELI5 |
| **Flashcards**  | 5-8 Q&A cards per transcript            |
| **Concepts**    | 6-10 key terms with definitions         |
| **Study Packs** | Bundled content with metadata           |

---

## 💰 Pricing & Costs

| Plan    | Minutes/Month | Price  |
| ------- | ------------- | ------ |
| Free    | 30 min        | $0     |
| Starter | 120 min       | $9.99  |
| Pro     | 500 min       | $29.99 |

**API Costs:** Whisper = $0.006/min, GPT-4o = ~$0.01-0.02/transcript

---

## 🎤 Demo Talking Points

1. **Upload** → Drag & drop, file validation, usage indicator
2. **Transcribe** → Progress bar, cost estimate
3. **Content** → Tab between summary tones
4. **Flashcards** → Flip through cards
5. **Library** → Grid/list view, search, filter

---

## 📈 Project Stats

- ~15,000+ lines of code | 30+ components | 20+ API endpoints | 7 DB tables

---

_Keep this handy during your presentation!_
