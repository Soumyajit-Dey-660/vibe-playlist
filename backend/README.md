# Vibe Playlist — Backend

NestJS API that orchestrates mood analysis and music search.

## Endpoints

### `POST /playlist/generate`

Accepts a base64 canvas image, analyzes the mood via GPT-4o, and returns matching tracks from the iTunes Search API.

**Body**
```json
{
  "imageBase64": "data:image/png;base64,...",
  "trackCount": 20
}
```

## Development

```bash
npm install
npm run start:dev
```

Runs on port `3001` by default.

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key with GPT-4o access |
| `OPENAI_MODEL` | No | `gpt-4o` | Model to use for vision analysis |
| `PORT` | No | `3001` | Server port |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |

## Scripts

```bash
npm run start:dev   # watch mode
npm run start:prod  # production (requires build)
npm run build       # compile TypeScript
npm run test        # unit tests
npm run test:e2e    # e2e tests
```
