import path from "node:path";

const tagPattern = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
const exportPattern = /\brino-export\s*=\s*(["'])(.*?)\1/i;

export function rinoExportUrl(tag, value)
{
    const relative = value.trim().replace(/^(?:\.\/|\/)+/, "");
    if (!relative) throw new Error("rino-export requires a file path");
    if (relative.split("/").includes(".."))
    {
        throw new Error(`rino-export escapes its output directory: ${ value }`);
    }

    const normalized = path.posix.normalize(`/${ relative }`);
    return `/${ tag === "style" ? "styles" : "scripts" }${ normalized }`;
}

export function collectRinoExports(htmlEntries)
{
    const exports = new Map();
    for (const entry of htmlEntries)
    {
        const html = entry?.body?.toString?.() || "";
        for (const match of html.matchAll(tagPattern))
        {
            const exportValue = match[2].match(exportPattern)?.[2];
            if (exportValue === undefined) continue;

            const url = rinoExportUrl(match[1].toLowerCase(), exportValue);
            if (!exports.has(url)) exports.set(url, new Set());
            exports.get(url).add(match[3].trim());
        }
    }
    return exports;
}

export function applyRinoExports(entries, htmlUrls)
{
    const output = new Map(entries);
    const htmlEntries = [...htmlUrls].sort().map(url => entries.get(url)).filter(Boolean);
    for (const [url, blocks] of collectRinoExports(htmlEntries))
    {
        const existing = output.get(url);
        const parts = [];
        if (existing?.body?.length) parts.push(existing.body.toString().replace(/\s+$/, ""));
        parts.push(...[...blocks].filter(Boolean));
        const contentType = url.startsWith("/styles/")
            ? "text/css; charset=utf-8"
            : "application/javascript; charset=utf-8";
        output.set(url, Object.freeze({ body: parts.join("\n"), contentType, builtAt: Date.now() }));
    }
    return output;
}
