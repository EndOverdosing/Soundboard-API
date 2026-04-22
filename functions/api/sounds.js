const SOUNDS_JS_URL = "https://cdn.jsdelivr.net/gh/genizy/soundboard@main/sounds.js";
const AUDIO_BASE = "https://cdn.jsdelivr.net/gh/genizy/soundboard@main/media/sounds";

export async function onRequest(context) {
    const { request } = context;

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    let rawJs;
    try {
        const res = await fetch(SOUNDS_JS_URL);
        if (!res.ok) {
            return jsonResponse({ error: "Failed to fetch sounds source", upstream_status: res.status }, 502);
        }
        rawJs = await res.text();
    } catch (e) {
        return jsonResponse({ error: "Network error fetching sounds source", detail: String(e) }, 502);
    }

    const splitterIdx = rawJs.indexOf("// SPLITTER");
    const searchFrom = splitterIdx !== -1 ? rawJs.slice(splitterIdx) : rawJs;
    const arrayMatch = searchFrom.match(/\[[\s\S]*\]/);

    if (!arrayMatch) {
        return jsonResponse({ error: "Could not locate JSON array in sounds source" }, 500);
    }

    let sounds;
    try {
        sounds = JSON.parse(arrayMatch[0]);
    } catch (e) {
        return jsonResponse({ error: "JSON parse failed", detail: String(e) }, 500);
    }

    const url = new URL(request.url);
    const baseUrl = `${url.origin}/api/play`;

    const mapped = sounds.map((sound, index) => {
        const filename = sound.mp3.split("/").pop();
        return {
            id: index,
            name: sound.name,
            color: sound.color,
            mp3: `${baseUrl}/${filename}`,
        };
    });

    const params = url.searchParams;
    const search = (params.get("search") || "").toLowerCase();
    const limit = Math.max(1, parseInt(params.get("limit")) || 1800);
    const offset = Math.max(0, parseInt(params.get("offset")) || 0);

    let result = search ? mapped.filter((s) => s.name.toLowerCase().includes(search)) : mapped;
    const total = result.length;
    result = result.slice(offset, offset + limit);

    return jsonResponse({ total, offset, limit, sounds: result });
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
}