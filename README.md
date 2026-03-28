# 🎨 Vibe Playlist

Draw your mood on a canvas. Get a matching Spotify playlist.

Vibe Playlist uses GPT-4o vision to read the emotional signal from your drawing — line quality, color, density, subject matter — and maps it to music. Spotify is then searched for real tracks that fit the mood.

---

## How it works

1. Draw anything on the canvas — scribbles, shapes, colors, words
2. Hit **Generate Playlist**
3. The drawing is sent to GPT-4o which returns a mood analysis (energy, valence, tempo, genres)
4. Spotify is searched using the generated terms
5. A deduplicated, shuffled playlist is returned with 30-second previews

---

## Stack

| Layer    | Tech                              |
| -------- | --------------------------------- |
| Frontend | React 19, Vite, TypeScript        |
| Backend  | NestJS, TypeScript                |
| AI       | OpenAI API — GPT-4o vision        |
| Music    | Spotify Web API (Client Credentials) |

---

## Project structure

```
vibe-playlist/
├── frontend/          # React + Vite app (port 5173)
│   └── src/
│       ├── components/
│       │   ├── Canvas/        # Drawing canvas + toolbar
│       │   └── Playlist/      # Mood card + track list
│       ├── hooks/
│       │   ├── useCanvas.ts   # Drawing logic (DPI-aware, undo/redo, shapes)
│       │   └── usePlaylist.ts # API call state
│       ├── api/
│       │   └── playlistApi.ts
│       └── types/index.ts
│
└── backend/           # NestJS API (port 3001)
    └── src/
        ├── claude/            # GPT-4o vision mood analysis
        ├── spotify/           # Spotify auth + track search
        ├── playlist/          # Orchestration service
        └── config/
```

---

## API

```
POST /api/playlist/generate
```

**Request**
```json
{
  "imageBase64": "data:image/png;base64,...",
  "trackCount": 20
}
```

**Response**
```json
{
  "mood": {
    "moodLabel": "Thunder",
    "interpretation": "...",
    "genres": ["dark ambient", "post-rock"],
    "energy": "high",
    "valence": "dark",
    "tempo": "fast"
  },
  "tracks": [...],
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Setup

### Prerequisites

- Node.js 20+
- An [OpenAI API key](https://platform.openai.com) with GPT-4o access
- A [Spotify app](https://developer.spotify.com/dashboard) (Client ID + Secret)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=3001
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
CORS_ORIGIN=http://localhost:5173
```

```bash
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
