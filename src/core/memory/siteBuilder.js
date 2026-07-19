import { buildMemoryAssets } from "./buildAssets.js";
import { buildMemoryContent } from "./buildContent.js";
import { buildMemoryMetadata } from "./buildMetadata.js";
import { buildMemoryPages } from "./buildPages.js";
import { buildMemoryPublic } from "./buildPublic.js";

const builders = {
    public: buildMemoryPublic,
    assets: buildMemoryAssets,
    pages: buildMemoryPages,
    content: buildMemoryContent,
    metadata: buildMemoryMetadata
};

export async function buildScopes(context, scopes)
{
    const entries = new Map();
    const urlsByScope = new Map();
    const entriesByScope = new Map();

    for (const scope of scopes)
    {
        const urls = new Set();
        const scopeEntries = new Map();
        const write = (url, body, contentType) =>
        {
            if (urls.has(url)) throw new Error(`Duplicate generated URL in ${ scope }: ${ url }`);
            const entry = Object.freeze({ body, contentType, builtAt: Date.now() });
            entries.set(url, entry);
            scopeEntries.set(url, entry);
            urls.add(url);
        };
        await builders[scope](context, write);
        urlsByScope.set(scope, urls);
        entriesByScope.set(scope, scopeEntries);
    }

    return { entries, entriesByScope, urlsByScope };
}
