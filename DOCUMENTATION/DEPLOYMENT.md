# Deployment Guide

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

## Local Development

```bash
wrangler pages dev .
```

API runs at `http://127.0.0.1:8788`.

> **Note:** Wrangler's local dev server makes real outbound fetch calls to jsDelivr. If you see 502 errors locally, check your internet connection or try deploying directly to Cloudflare Pages.

## Deploy via CLI

```bash
wrangler pages deploy . --project-name soundboard-api
```

On first run, Wrangler will create the project automatically. Subsequent deploys update it.

## Deploy via GitHub (Recommended)

1. Push this repo to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
3. Select **Pages** → **Connect to Git**
4. Choose your repository
5. Set build settings:
   - **Framework preset**: None
   - **Build command**: *(leave empty)*
   - **Build output directory**: `/` (root)
6. Click **Save and Deploy**

Every push to `main` will trigger a new deployment automatically.

## Custom Domain

1. In Cloudflare Pages, go to your project → **Custom domains**
2. Add your domain (e.g. `sounds.yourdomain.com`)
3. Cloudflare will automatically provision an SSL certificate

## Environment Variables

This API has no required environment variables. All configuration is derived at runtime from the upstream GitHub source.

## Caching Behavior

| Route | Cache |
|-------|-------|
| `/api/sounds` | `max-age=300` (5 minutes, via `_headers`) |
| `/api/play/*.mp3` | `max-age=86400` (24 hours, via response header) |

Cloudflare's edge cache will serve audio files globally without hitting the origin on every request.

## Updating Sounds

No action required. The `/api/sounds` endpoint fetches the upstream `sounds.js` on each request (with 5-minute edge caching). When new sounds are added to the [genizy/soundboard](https://github.com/genizy/soundboard) repo, they appear in the API automatically within 5 minutes.