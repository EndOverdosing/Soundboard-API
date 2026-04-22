# Audio Streaming Guide

## Audio URLs

Each sound in `/api/sounds` includes a single audio URL:

| Field | Description |
|-------|-------------|
| `mp3` | Routed through `/api/play/` with CORS support and Range requests for seeking |

## Playing Audio in the Browser

### Simplest approach
```js
const res = await fetch('https://your-domain.pages.dev/api/sounds');
const { sounds } = await res.json();

const audio = new Audio(sounds[0].mp3);
audio.play();
```

### With the HTML `<audio>` element
```html
<audio controls src="https://your-domain.pages.dev/api/play/vine-boom.mp3"></audio>
```

## HTTP Range Requests

The `/api/play/` endpoint passes through `Range` headers from the upstream CDN, enabling:
- Audio seeking without downloading the full file
- Progressive streaming in browsers
- Efficient mobile playback

Browsers send Range requests automatically when using `<audio>` or the Web Audio API, so no extra configuration is needed.

## Fetching All Sounds and Building a Player

```js
async function loadSounds() {
  const res = await fetch('/api/sounds');
  const { sounds } = await res.json();

  sounds.forEach(sound => {
    const btn = document.createElement('button');
    btn.textContent = sound.name;
    btn.style.background = sound.color;
    btn.onclick = () => new Audio(sound.mp3).play();
    document.body.appendChild(btn);
  });
}

loadSounds();
```

## Searching Sounds

```js
async function search(query) {
  const res = await fetch(`/api/sounds?search=${encodeURIComponent(query)}`);
  const { sounds, total } = await res.json();
  console.log(`Found ${total} results`, sounds);
}

search('vine');
```

## Pagination

```js
async function getPage(page, pageSize = 20) {
  const offset = page * pageSize;
  const res = await fetch(`/api/sounds?limit=${pageSize}&offset=${offset}`);
  return res.json();
}

const page1 = await getPage(0);
const page2 = await getPage(1);
```

## CORS

All endpoints return `Access-Control-Allow-Origin: *`, so they can be called from any browser origin without a proxy.