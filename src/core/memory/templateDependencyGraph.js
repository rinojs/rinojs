import fsp from "node:fs/promises";
import path from "node:path";
import { fileExists, getFilesRecursively } from "../fsHelper.js";

function attribute(source, name)
{
    return source.match(new RegExp(`${ name }\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];
}

async function templateReferences(filePath, dirs, seen, dependencies)
{
    const resolved = path.resolve(filePath);
    if (seen.has(resolved)) return;
    seen.add(resolved);
    dependencies.add(resolved);
    if (!await fileExists(resolved)) return;

    const html = await fsp.readFile(resolved, "utf8");
    for (const match of html.matchAll(/<component\s+([^>]+?)(?:\/?>)/gi))
    {
        const component = attribute(match[1], "rino-path");
        if (!component) continue;
        await templateReferences(path.join(dirs.components, `${ component }.html`), dirs, seen, dependencies);
    }

    for (const match of html.matchAll(/<script\s+([^>]+)>/gi))
    {
        const type = attribute(match[1], "rino-type")?.toLowerCase();
        const markdown = attribute(match[1], "rino-path");
        if ((type === "md" || type === "markdown") && markdown)
        {
            dependencies.add(path.resolve(dirs.mds, `${ markdown }.md`));
        }
    }
}

export class TemplateDependencyGraph
{
    constructor(reverseEdges = new Map())
    {
        this.reverseEdges = reverseEdges;
    }

    affectedBy(filePath)
    {
        const affected = this.reverseEdges.get(path.resolve(filePath)) || new Set();
        const pages = new Set();
        const themes = new Set();
        for (const entry of affected)
        {
            if (entry.kind === "page") pages.add(entry.path);
            if (entry.kind === "theme") themes.add(entry.theme);
        }
        return { pages, themes };
    }
}

export async function buildTemplateDependencyGraph(context)
{
    const entries = [];
    for (const pagePath of await getFilesRecursively(context.dirs.pages, [".html"]))
    {
        entries.push({ kind: "page", path: pagePath });
    }
    for (const template of await getFilesRecursively(context.dirs.contentTheme, [".html"]))
    {
        entries.push({ kind: "theme", path: template, theme: path.relative(context.dirs.contentTheme, template).split(path.sep)[0] });
    }

    const reverse = new Map();
    for (const entry of entries)
    {
        const dependencies = new Set();
        await templateReferences(entry.path, context.dirs, new Set(), dependencies);
        for (const dependency of dependencies)
        {
            if (!reverse.has(dependency)) reverse.set(dependency, new Set());
            reverse.get(dependency).add(entry);
        }
    }
    return new TemplateDependencyGraph(reverse);
}
