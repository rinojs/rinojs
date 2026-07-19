import path from "node:path";
import { bundleGeneralJS } from "../bundleGeneralJS.js";
import { bundleGeneralTS } from "../bundleGeneralTS.js";

const tagPattern = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
const exportPattern = /\brino-export\s*=\s*(["'])(.*?)\1/i;
const typePattern = /\brino-type\s*=\s*(["'])(.*?)\1/i;
const typeScriptExtensionPattern = /\.(?:[cm]?ts|tsx)$/i;

function rinoScriptType(attributes, exportValue)
{
    const value = attributes.match(typePattern)?.[2]?.trim().toLowerCase();
    if (!value) return typeScriptExtensionPattern.test(exportValue.trim()) ? "ts" : "js";
    if (value === "js" || value === "javascript") return "js";
    if (value === "ts" || value === "typescript") return "ts";
    throw new Error(`Unsupported rino-type for script export: ${ value }`);
}

export function rinoExportUrl(tag, value)
{
    const relative = value.trim().replace(/^(?:\.\/|\/)+/, "");
    if (!relative) throw new Error("rino-export requires a file path");
    if (relative.split("/").includes(".."))
    {
        throw new Error(`rino-export escapes its output directory: ${ value }`);
    }

    const normalized = path.posix.normalize(`/${ relative }`);
    const output = tag === "script" ? normalized.replace(typeScriptExtensionPattern, ".js") : normalized;
    return `/${ tag === "style" ? "styles" : "scripts" }${ output }`;
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

            const tag = match[1].toLowerCase();
            const type = tag === "script" ? rinoScriptType(match[2], exportValue) : "css";
            const content = match[3].trim();
            const url = rinoExportUrl(tag, exportValue);
            if (!exports.has(url)) exports.set(url, new Map());
            exports.get(url).set(`${ type }\0${ content }`, { content, type });
        }
    }
    return exports;
}

export function removeRinoExportTags(html)
{
    return html.replace(tagPattern, (tag, _tagName, attributes) =>
        exportPattern.test(attributes) ? "" : tag);
}

async function bundledExportBlocks(url, blocks, options)
{
    const entries = [...blocks.values()].filter(block => block.content);
    if (!url.startsWith("/scripts/")) return entries.map(block => block.content);

    const name = path.posix.basename(url, path.posix.extname(url));
    const bundled = [];
    for (const block of entries)
    {
        if (block.type === "ts")
        {
            if (!options.projectPath) throw new Error("rino-type=\"ts\" exports require a project path");
            bundled.push(await bundleGeneralTS(block.content, options.projectPath, name));
            continue;
        }
        bundled.push(await bundleGeneralJS(block.content, name));
    }
    return bundled;
}

export async function applyRinoExports(entries, htmlUrls, options = {})
{
    const output = new Map(entries);
    const htmlEntries = [...htmlUrls].sort().map(url => entries.get(url)).filter(Boolean);
    for (const [url, blocks] of collectRinoExports(htmlEntries))
    {
        const existing = output.get(url);
        const parts = [];
        if (existing?.body?.length) parts.push(existing.body.toString().replace(/\s+$/, ""));
        parts.push(...await bundledExportBlocks(url, blocks, options));
        const contentType = url.startsWith("/styles/")
            ? "text/css; charset=utf-8"
            : "application/javascript; charset=utf-8";
        output.set(url, Object.freeze({ body: parts.join("\n"), contentType, builtAt: Date.now() }));
    }
    for (const url of htmlUrls)
    {
        const entry = output.get(url);
        if (!entry) continue;
        output.set(url, Object.freeze({
            ...entry,
            body: removeRinoExportTags(entry.body.toString())
        }));
    }
    return output;
}
