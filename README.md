![Banner](/public/assets/banner.png)

# Soundboard API

A zero-hardcoded REST API built on Cloudflare Pages Functions that dynamically sources all sound data from the [genizy/soundboard](https://github.com/genizy/soundboard) GitHub repository.

No sounds, filenames, or metadata are stored in this codebase. Everything is fetched and parsed live.

## Quick Start

```bash
npm install -g wrangler
wrangler pages dev .
```

API will be available at `http://localhost:8788`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API index — lists all routes and examples |
| `GET` | `/api/sounds` | Returns all sounds as JSON |
| `GET` | `/api/sounds?search=fart` | Filter sounds by name |
| `GET` | `/api/play/:filename.mp3` | Proxy-stream an MP3 file |

## File Structure

```
/
├── functions/
│   ├── index.js                  # GET / — route listing
│   └── api/
│       ├── sounds.js             # GET /api/sounds
│       └── play/
│           └── [[path]].js       # GET /api/play/:filename.mp3
├── _headers                      # Cloudflare CORS + cache headers
├── _redirects                    # Root redirect rule
├── README.md
└── DOCUMENTATION/
    ├── ENDPOINTS.md
    ├── AUDIO.md
    └── DEPLOYMENT.md
```

## Documentation

See the [`DOCUMENTATION/`](./DOCUMENTATION/) folder for detailed guides:

- [ENDPOINTS.md](./DOCUMENTATION/ENDPOINTS.md) — Full endpoint reference
- [AUDIO.md](./DOCUMENTATION/AUDIO.md) — Audio streaming and playback guide
- [DEPLOYMENT.md](./DOCUMENTATION/DEPLOYMENT.md) — Deploying to Cloudflare Pages

## Data Source

Sounds are sourced from:
- **Metadata**: `https://cdn.jsdelivr.net/gh/genizy/soundboard@main/sounds.js`
- **Audio files**: `https://cdn.jsdelivr.net/gh/genizy/soundboard@main/media/sounds/<filename>.mp3`

Both are served via jsDelivr CDN from the public GitHub repository.