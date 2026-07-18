import http from "node:http";
import path from "node:path";
import cors from "cors";
import express from "express";
import { createWSS } from "../wss.js";
import { createMemoryBuildEngine } from "../memory/buildEngine.js";
import { scopesForChange } from "../memory/invalidation.js";
import { createMemorySiteHandler } from "../memory/siteMiddleware.js";
import { createBuildWatcher, waitForWatcher } from "../memory/watcher.js";
import { createServerController } from "./serverController.js";
import { createPublicHtmlHandler } from "./publicHtml.js";

const serverBuildScopes = ["assets", "pages", "content", "metadata"];

function sourceRoot(projectPath, filePath)
{
    return path.relative(projectPath, filePath).replace(/\\/g, "/").split("/")[0];
}

function watchPaths(projectPath)
{
    return ["pages", "components", "mds", "public", "scripts", "styles",
        "contents", "content-theme", "i18n", "rino-config.js"]
        .map(name => path.join(projectPath, name));
}

function listen(server, port)
{
    return new Promise((resolve, reject) =>
    {
        server.once("error", reject);
        server.listen(port, () =>
        {
            server.off("error", reject);
            resolve();
        });
    });
}

export async function startMemoryServer(projectPath, port, options = {})
{
    const engine = createMemoryBuildEngine(projectPath, { initialScopes: serverBuildScopes });
    const initial = await engine.buildInitial();
    const app = express();
    app.use(cors());
    const publicDir = path.join(projectPath, "public");
    app.use(createPublicHtmlHandler(publicDir, options.watch ? port : null));
    app.use(express.static(publicDir, {
        cacheControl: true,
        maxAge: 0
    }));
    app.get(/.*/, createMemorySiteHandler(engine, {
        reloadPort: options.watch ? port : null
    }));

    const server = http.createServer(app);
    await listen(server, port);
    const wss = options.watch ? await createWSS(server) : null;
    const watcher = options.watch ? createBuildWatcher(watchPaths(projectPath), async changes =>
    {
        const scopes = new Set();
        const templateChanges = [];
        let publicChanged = false;
        for (const change of changes)
        {
            const root = sourceRoot(projectPath, change.path);
            if (root === "public")
            {
                publicChanged = true;
                continue;
            }
            if (root === "components" || root === "mds")
            {
                templateChanges.push(change.path);
                continue;
            }
            for (const scope of scopesForChange(projectPath, change.path)) scopes.add(scope);
        }

        const results = [];
        if (scopes.size) results.push(await engine.rebuild([...scopes]));
        if (templateChanges.length && !scopes.has("pages") && !scopes.has("content"))
        {
            results.push(await engine.rebuildTemplates(templateChanges));
        }
        const changedUrls = results.flatMap(result => result.changedUrls);
        const result = results.at(-1) || {
            buildId: engine.buildId,
            scopes: [],
            changedUrls: [],
            duration: 0
        };
        if (publicChanged || changedUrls.length) for (const client of wss.clients)
        {
            if (client.readyState === client.OPEN) client.send("reload");
        }
        options.onBuild?.({ ...result, changedUrls }, changes);
    }) : null;

    if (watcher) await waitForWatcher(watcher);

    const controller = createServerController({ port, server, watcher, wss });
    return Object.assign(controller, { engine, initial });
}
