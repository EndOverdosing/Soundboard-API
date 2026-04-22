const ROUTES = [
    {
        method: "GET",
        path: "/api/sounds",
        description: "List all sounds. Supports search, limit, and offset query params.",
        params: [
            { name: "search", type: "string", required: false, description: "Filter sounds by name (case-insensitive)" },
            { name: "limit", type: "number", required: false, default: 1800, description: "Number of results to return" },
            { name: "offset", type: "number", required: false, default: 0, description: "Number of results to skip" },
        ],
        response: {
            total: "Total number of sounds matching the query",
            offset: "Current offset",
            limit: "Current limit",
            sounds: "Array of sound objects",
        },
        example_sound: {
            id: 0,
            name: "VINE BOOM SOUND",
            color: "rgb(255, 0, 0)",
            mp3: "/api/play/vine-boom.mp3",
        },
    },
    {
        method: "GET",
        path: "/api/play/:filename.mp3",
        description: "Stream or download a sound file by filename. Supports HTTP Range requests for seeking.",
        params: [
            { name: "filename", type: "string", required: true, in: "path", description: "The MP3 filename (e.g. vine-boom.mp3)" },
        ],
        headers: [
            { name: "Range", required: false, description: "Standard HTTP Range header for partial content (e.g. bytes=0-1024)" },
        ],
        response: "audio/mpeg stream",
    },
];

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const enriched = ROUTES.map((route) => ({
        ...route,
        example_url: `${url.origin}${route.path.replace(":filename.mp3", "vine-boom.mp3")}`,
    }));

    const body = {
        name: "Soundboard API",
        version: "1.0.0",
        description: "A zero-hardcoded REST API that dynamically sources sounds from the genizy/soundboard GitHub repository.",
        source: "https://github.com/genizy/soundboard",
        base_url: url.origin,
        routes: enriched,
    };

    return new Response(JSON.stringify(body, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}
