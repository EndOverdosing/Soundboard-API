const AUDIO_BASE = "https://cdn.jsdelivr.net/gh/genizy/soundboard@main/media/sounds";

export async function onRequest(context) {
    const { request, params } = context;

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        return errResponse("Method not allowed", 405);
    }

    const pathSegments = params.path;
    if (!pathSegments || pathSegments.length === 0) {
        return errResponse("No file specified", 400);
    }

    const filename = pathSegments[pathSegments.length - 1];

    if (!filename.endsWith(".mp3")) {
        return errResponse("Only .mp3 files are supported", 400);
    }

    const upstreamUrl = `${AUDIO_BASE}/${filename}`;
    const upstreamReqHeaders = new Headers();
    upstreamReqHeaders.set("User-Agent", "Mozilla/5.0 (compatible; SoundboardAPI/1.0)");

    const rangeHeader = request.headers.get("Range");
    if (rangeHeader) {
        upstreamReqHeaders.set("Range", rangeHeader);
    }

    let upstream;
    try {
        upstream = await fetch(upstreamUrl, { method: request.method, headers: upstreamReqHeaders });
    } catch (e) {
        return errResponse(`Failed to fetch audio: ${String(e)}`, 502);
    }

    if (!upstream.ok && upstream.status !== 206) {
        return errResponse("Audio not found", upstream.status === 404 ? 404 : 502);
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "audio/mpeg");
    responseHeaders.set("Cache-Control", "public, max-age=86400");
    responseHeaders.set("Accept-Ranges", "bytes");

    const contentLength = upstream.headers.get("Content-Length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    const contentRange = upstream.headers.get("Content-Range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    for (const [k, v] of Object.entries(corsHeaders())) {
        responseHeaders.set(k, v);
    }

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    };
}

function errResponse(message, status) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
}