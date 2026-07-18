import { EventEmitter } from "node:events";
import { createSiteContext } from "./siteContext.js";
import { allBuildScopes, scopesForChange } from "./invalidation.js";
import { MemoryOutputStore } from "./outputStore.js";
import { buildScopes } from "./siteBuilder.js";
import { buildMemoryPages, pageOutputUrls } from "./buildPages.js";
import { buildMemoryContent } from "./buildContent.js";
import { buildTemplateDependencyGraph } from "./templateDependencyGraph.js";

export class MemoryBuildEngine extends EventEmitter
{
    #queue = Promise.resolve();
    #scopeEntries = new Map();

    constructor(projectPath, options = {})
    {
        super();
        this.projectPath = projectPath;
        this.store = new MemoryOutputStore();
        this.buildId = 0;
        this.status = "idle";
        this.lastError = null;
        this.initialScopes = options.initialScopes || allBuildScopes;
        this.dependencyGraph = null;
    }

    async buildInitial()
    {
        return this.rebuild(this.initialScopes);
    }

    rebuildChanged(filePath)
    {
        return this.rebuild(scopesForChange(this.projectPath, filePath));
    }

    rebuild(scopes)
    {
        const requested = [...new Set(scopes)];
        const run = () => this.#performBuild(requested);
        const result = this.#queue.then(run, run);
        this.#queue = result.catch(() => {});
        return result;
    }

    rebuildTemplates(filePaths)
    {
        const run = () => this.#performTemplateBuild(filePaths);
        const result = this.#queue.then(run, run);
        this.#queue = result.catch(() => {});
        return result;
    }

    #composeSnapshot()
    {
        const next = new Map();
        for (const scope of allBuildScopes)
        {
            for (const [url, entry] of this.#scopeEntries.get(scope) || []) next.set(url, entry);
        }
        return next;
    }

    async #performBuild(scopes)
    {
        const startedAt = Date.now();
        this.status = "building";
        this.emit("build-start", { scopes });

        try
        {
            const context = await createSiteContext(this.projectPath);
            const built = await buildScopes(context, scopes);
            const graph = await buildTemplateDependencyGraph(context);
            for (const scope of scopes)
            {
                this.#scopeEntries.set(scope, built.entriesByScope.get(scope) || new Map());
            }

            this.store.replace(this.#composeSnapshot());
            this.dependencyGraph = graph;
            this.buildId += 1;
            this.status = "ready";
            this.lastError = null;

            const result = {
                buildId: this.buildId,
                scopes,
                changedUrls: [...built.entries.keys()],
                duration: Date.now() - startedAt
            };
            this.emit("build-complete", result);
            return result;
        }
        catch (error)
        {
            this.status = this.store.size ? "ready" : "failed";
            this.lastError = error;
            this.emit("build-error", { error, scopes });
            throw error;
        }
    }

    async #performTemplateBuild(filePaths)
    {
        const startedAt = Date.now();
        const affected = { pages: new Set(), themes: new Set() };
        for (const filePath of filePaths)
        {
            const match = this.dependencyGraph?.affectedBy(filePath);
            for (const page of match?.pages || []) affected.pages.add(page);
            for (const theme of match?.themes || []) affected.themes.add(theme);
        }

        if (!affected.pages.size && !affected.themes.size)
        {
            const context = await createSiteContext(this.projectPath);
            this.dependencyGraph = await buildTemplateDependencyGraph(context);
            return { buildId: this.buildId, scopes: [], changedUrls: [], duration: Date.now() - startedAt };
        }

        this.status = "building";
        try
        {
            const context = await createSiteContext(this.projectPath);
            const pages = new Map();
            const content = new Map();
            const writeTo = target => (url, body, contentType) => target.set(url, Object.freeze({ body, contentType, builtAt: Date.now() }));
            if (affected.pages.size) await buildMemoryPages(context, writeTo(pages), { pagePaths: [...affected.pages] });
            if (affected.themes.size) await buildMemoryContent(context, writeTo(content), { themes: [...affected.themes] });
            const graph = await buildTemplateDependencyGraph(context);

            const pageScope = new Map(this.#scopeEntries.get("pages") || []);
            for (const pagePath of affected.pages)
            {
                for (const url of pageOutputUrls(context, pagePath)) pageScope.delete(url);
            }
            for (const entry of pages) pageScope.set(...entry);

            const contentScope = new Map(this.#scopeEntries.get("content") || []);
            for (const theme of affected.themes)
            {
                for (const url of contentScope.keys())
                {
                    if (url.startsWith(`/contents/${ theme }/`) || url.startsWith(`/contents-list/${ theme }/`)) contentScope.delete(url);
                }
            }
            for (const entry of content) contentScope.set(...entry);

            this.#scopeEntries.set("pages", pageScope);
            this.#scopeEntries.set("content", contentScope);
            this.store.replace(this.#composeSnapshot());
            this.dependencyGraph = graph;
            this.buildId += 1;
            this.status = "ready";
            this.lastError = null;
            return {
                buildId: this.buildId,
                scopes: ["templates"],
                changedUrls: [...pages.keys(), ...content.keys()],
                duration: Date.now() - startedAt
            };
        }
        catch (error)
        {
            this.status = this.store.size ? "ready" : "failed";
            this.lastError = error;
            throw error;
        }
    }
}

export function createMemoryBuildEngine(projectPath, options)
{
    return new MemoryBuildEngine(projectPath, options);
}
