import path from "path";
import chokidar from "chokidar";
import chalk from "chalk";
import cors from "cors";
import http from "http";
import express from "express";
import { defaultMessage } from "./consoleMessages.js";
import { createWSS } from "./wss.js";
import { injectReload } from "./inject-reload.js";
import { buildComponent } from "./component.js";
import { loadConfig } from "./configLoader.js";
import { fileExists } from "./fsHelper.js"
import { registerAssetRoutes } from "./server/assetRoutes.js";
import { buildCategoryLinks } from "./server/categoryLinks.js";
import { registerContentRoutes } from "./server/contentRoutes.js";
import { registerMetadataRoutes } from "./server/metadataRoutes.js";
import { createServerController } from "./server/serverController.js";

export async function staticSiteServer(projectPath, port = 3000)
{
    if (!projectPath)
    {
        console.error(`Project path does not exist.`);
        return;
    }

    const state = {
        config: await loadConfig(projectPath),
        wss: null
    };
    const dirs = {
        pages: path.join(projectPath, "pages"),
        components: path.join(projectPath, "components"),
        public: path.join(projectPath, "public"),
        scripts: path.join(projectPath, "scripts"),
        styles: path.join(projectPath, "styles"),
        mds: path.join(projectPath, "mds"),
        contents: path.join(projectPath, "contents"),
        contentTheme: path.join(projectPath, "content-theme"),
    };

    chokidar
    const watcher = chokidar
        .watch([
            dirs.pages,
            dirs.components,
            dirs.mds,
            dirs.public,
            dirs.scripts,
            dirs.styles,
            dirs.contents,
            dirs.contentTheme
        ], { ignoreInitial: true })
        .on("all", (event, filePath) => handleFileChange(filePath, event, port, state));

    const server = await startServer(projectPath, port, state);

    return createServerController({
        port,
        server,
        watcher,
        wss: state.wss
    });
}

function handleFileChange(filePath, event, port, state)
{
    console.clear();
    console.log(defaultMessage);
    console.log(`
Server listening on port ${ port }
${ chalk.blueBright.underline(`http://localhost:` + port) }
            `);

    console.log(`${ chalk.bgMagenta(filePath) } is ${ chalk.blue(event) }!`);

    if (state.wss)
    {
        state.wss.clients.forEach((client) =>
        {
            client.send("reload");
        });
    }
}


async function startServer(projectPath, port, state)
{
    const app = express();
    app.use(cors());
    app.use(express.static(path.join(projectPath, "public")));

    registerAssetRoutes(app, projectPath);
    registerContentRoutes(app, projectPath, port);
    registerMetadataRoutes(app, projectPath, state.config);


    app.get(/.*/, async (req, res) =>
    {
        const categoryLinks = await buildCategoryLinks(path.join(projectPath, "contents"));

        let decodedPath = decodeURIComponent(req.path);
        let reqPath = decodedPath.endsWith("/") ? decodedPath + "index.html" : decodedPath;
        let pagePath = path.join(projectPath, "pages", reqPath);
        if (!pagePath.endsWith(".html")) pagePath += ".html";

        const pageArgs = {
            pagePath: pagePath,
            categoryLinks: categoryLinks
        }

        if (await fileExists(pagePath))
        {
            let content = await buildComponent(pagePath, path.join(projectPath, "components"), path.join(projectPath, "mds"), [JSON.stringify(pageArgs)]);
            content = await injectReload(content, port);
            res.send(content);
        }
        else
        {
            res.status(404).send("Page not found");
        }
    });

    const server = http.createServer(app);

    server.listen(port, () =>
    {
        console.log(defaultMessage);
        console.log(`
Server listening on port ${ port }
${ chalk.blueBright(`http://localhost:` + port) }
            `);
    });

    state.wss = await createWSS(server);
    return server;
}
