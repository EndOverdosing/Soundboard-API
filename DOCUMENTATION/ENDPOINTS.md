# Endpoint Reference

## `GET /`

Returns a JSON description of all available API routes with example URLs.

**Response**
```json
{
  "name": "Soundboard API",
  "version": "1.0.0",
  "description": "...",
  "base_url": "https://your-domain.pages.dev",
  "routes": [ ... ]
}
```

---

## `GET /api/sounds`

Returns all sounds fetched dynamically from the upstream source. No data is hardcoded.

**Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | — | Case-insensitive name filter |
| `limit` | number | No | `200` | Max results to return (max: 200) |
| `offset` | number | No | `0` | Results to skip (for pagination) |

**Example Requests**

```
GET /api/sounds
GET /api/sounds?search=vine
GET /api/sounds?limit=10&offset=0
GET /api/sounds?search=fart&limit=5
```

**Response**
```json
{
  "total": 87,
  "offset": 0,
  "limit": 200,
  "sounds": [
    {
      "id": 0,
      "name": "FAHHHHHHHHHHHHHH",
      "color": "rgb(255, 0, 0)",
      "mp3": "https://cdn.jsdelivr.net/gh/genizy/soundboard@main/media/sounds/fahhhhhhhhhhhhhh.mp3",
      "mp3_proxy": "https://your-domain.pages.dev/api/play/fahhhhhhhhhhhhhh.mp3"
    }
  ]
}
```

**Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Zero-indexed position in the upstream source |
| `name` | string | Display name of the sound |
| `color` | string | CSS color string associated with this sound |
| `mp3` | string | Direct CDN URL to the MP3 file |
| `mp3_proxy` | string | Proxied URL through this API (supports CORS + Range) |

---

## `GET /api/play/:filename.mp3`

Proxies an MP3 file from the upstream CDN. Supports HTTP Range requests for audio seeking and streaming.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `filename.mp3` | The MP3 filename exactly as it appears in the `sounds` array |

**Request Headers**

| Header | Required | Description |
|--------|----------|-------------|
| `Range` | No | Standard byte-range header (e.g. `bytes=0-65535`) |

**Example Requests**

```
GET /api/play/vine-boom.mp3
GET /api/play/dry-fart.mp3
HEAD /api/play/anime-wow-sound-effect.mp3
```

**Response Headers**

| Header | Value |
|--------|-------|
| `Content-Type` | `audio/mpeg` |
| `Accept-Ranges` | `bytes` |
| `Cache-Control` | `public, max-age=86400` |
| `Content-Range` | Present when a `Range` request is made |

**Error Responses**

| Status | Meaning |
|--------|---------|
| `400` | Missing filename or non-.mp3 extension |
| `404` | File not found upstream |
| `405` | Method not allowed |
| `502` | Upstream fetch failed |