import fsp from "fs/promises";
import path from "path";
import chokidar from "chokidar";
import chalk from "chalk";
import cors from "cors";
import http from "http";
import express from "express";
import { defaultMessage } from "./consoleMessages.js";
import { findPort } from "./find-port.js";
import { createWSS } from "./wss.js";
import { openBrowser } from "./browser.js";
import { injectReload } from "./inject-reload.js";
import { buildComponent } from "./component.js";
import { bundleJS } from "./bundleJS.js";
import { bundleTS } from "./bundleTS.js";
import { bundleCSS } from "./bundleCSS.js";
import { buildContent } from "./content.js";
import { buildContentList } from "./contentList.js";
import { loadConfig } from "./configLoader.js";
import { fileExists } from "./fsHelper.js"


let wss = null;

export async function devStaticSite (projectPath)
{
    if (!projectPath)
    {
        console.error(`Project path does not exist.`);
        return;
    }

    const config = await loadConfig(projectPath);
    const port = config.port || 3000;
    const resolvedPort = await findPort(port);
    const dirs = {
        pages: path.join(projectPath, "pages"),
        components: path.join(projectPath, "components"),
        public: path.join(projectPath, "public"),
        scripts: path.join(projectPath, "scripts"),
        styles: path.join(projectPath, "styles"),
        mds: path.join(projectPath, "mds"),
        contents: path.join(projectPath, "contents"),
    };

    chokidar
        .watch([
            dirs.pages,
            dirs.components,
            dirs.mds,
            dirs.public,
            dirs.scripts,
            dirs.styles,
            dirs.contents
        ], { ignoreInitial: true })
        .on("all", (event, filePath) => handleFileChange(filePath, event, resolvedPort));

    await startServer(projectPath, resolvedPort);
    const devUrl = `http://localhost:${resolvedPort}`;
    await openBrowser(devUrl);
}

function handleFileChange (filePath, event, port)
{
    console.clear();
    console.log(defaultMessage);
    console.log(`
Server listening on port ${port}
Development: ${chalk.blueBright.underline(`http://localhost:` + port)}
            `);

    console.log(`${chalk.bgMagenta(filePath)} is ${chalk.blue(event)}!`);

    if (wss)
    {
        wss.clients.forEach((client) =>
        {
            client.send("reload");
        });
    }
}


async function startServer (projectPath, port)
{
    const app = express();
    app.use(cors());
    app.use(express.static(path.join(projectPath, "public")));

    app.get("/scripts/*.js", async (req, res) =>
    {
        const requestPath = req.path.replace("/scripts", "");
        const jsPath = path.join(projectPath, "scripts/export", requestPath);
        const tsPath = path.join(
            projectPath,
            "scripts/export",
            path.basename(requestPath, path.extname(requestPath)) + ".ts"
        );

        try
        {
            if (await fileExists(jsPath))
            {
                const script = await bundleJS(jsPath, path.basename(jsPath, path.extname(jsPath)));
                res.setHeader("Content-Type", "application/javascript");
                res.send(script);
                return;
            }
            else if (await fileExists(tsPath))
            {
                const script = await bundleTS(tsPath, projectPath, path.basename(tsPath, path.extname(tsPath)));
                res.setHeader("Content-Type", "application/javascript");
                res.send(script);
                return;
            }

        }
        catch (err)
        {
            console.error("Script bundling error:", err);
            return;
        }


        res.status(404).send("File not found");
    });

    app.get("/styles/*.css", async (req, res) =>
    {
        const requestPath = req.path.replace("/styles", "");
        const stylePath = path.join(projectPath, "styles/export", requestPath);

        try
        {
            if (await fileExists(stylePath))
            {
                const raw = await fsp.readFile(stylePath, "utf8");
                const compiled = await bundleCSS(raw, path.dirname(stylePath));
                res.setHeader("Content-Type", "text/css");
                res.send(compiled);
                return;
            }
        }
        catch (err)
        {
            res.status(404).send("Style not found");
            return;
        }

        res.status(404).send("File not found");
    });

    app.get("/contents/*", async (req, res) =>
    {
        const slug = req.path.replace(/^\/contents\//, "");
        const [category, ...rest] = slug.split("/");
        const rawName = decodeURIComponent(rest.join("/"));
        const mdPath = path.join(projectPath, "contents", category, rawName + ".md");
        if (!await fileExists(mdPath)) return res.status(404).send("Content not found");

        const pagePath = path.join(projectPath, "pages", "content.html");
        let content = await buildContent(
            mdPath,
            pagePath,
            path.join(projectPath, "components"),
            path.join(projectPath, "mds"),
            [pagePath]
        );
        content = await injectReload(content, port);
        res.send(content);
    });

    app.get("/contents-list/*", async (req, res) =>
    {
        const slug = req.path.replace(/^\/contents-list\//, "");
        const [category, categoryPage] = slug.split("/");
        const pagePath = path.join(projectPath, "pages", "content-list.html");

        let content = await buildContentList(
            categoryPage,
            path.join(projectPath, "contents"),
            pagePath,
            path.join(projectPath, "components"),
            path.join(projectPath, "mds"),
            10, [pagePath]
        );
        content = await injectReload(content, port);
        res.send(content);
    });

    app.get("*", async (req, res) =>
    {
        let reqPath = req.path.endsWith("/") ? req.path + "index.html" : req.path;
        let pagePath = path.join(projectPath, "pages", reqPath);
        if (!pagePath.endsWith(".html")) pagePath += ".html";

        if (await fileExists(pagePath))
        {
            let content = await buildComponent(pagePath, path.join(projectPath, "components"), path.join(projectPath, "mds"), [pagePath]);
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
Server listening on port ${port}
Development: ${chalk.blueBright(`http://localhost:` + port)}
            `);
    });

    wss = await createWSS(server);
}
