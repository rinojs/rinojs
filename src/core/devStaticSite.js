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
import { loadConfig } from "./configLoader.js";
import { fileExists } from "./fsHelper.js"
import { loadI18nIndex, applyI18n } from "./i18n.js"
import { deepMerge } from "./deepMerge.js";
import { registerAssetRoutes } from "./server/assetRoutes.js";
import { buildCategoryLinks } from "./server/categoryLinks.js";
import { registerContentRoutes } from "./server/contentRoutes.js";
import { registerMetadataRoutes } from "./server/metadataRoutes.js";
import { createServerController } from "./server/serverController.js";

export async function devStaticSite(projectPath)
{
    if (!projectPath)
    {
        console.error(`Project path does not exist.`);
        return;
    }

    const state = {
        config: await loadConfig(projectPath),
        locales: [],
        i18nIndex: new Map(),
        wss: null
    };
    const port = state.config.port || 3000;
    const resolvedPort = await findPort(port);
    const dirs = {
        pages: path.join(projectPath, "pages"),
        components: path.join(projectPath, "components"),
        public: path.join(projectPath, "public"),
        scripts: path.join(projectPath, "scripts"),
        styles: path.join(projectPath, "styles"),
        mds: path.join(projectPath, "mds"),
        contents: path.join(projectPath, "contents"),
        contentTheme: path.join(projectPath, "content-theme"),
        i18n: path.join(projectPath, "i18n"),
    };

    try
    {
        await updateI18N(projectPath, state);
    }
    catch (error)
    {
        console.error(`${ chalk.yellowBright(`Failed to reload i18n index: `) } ${ chalk.red(error) }`);
    }

    const watcher = chokidar
        .watch([
            dirs.pages,
            dirs.components,
            dirs.mds,
            dirs.public,
            dirs.scripts,
            dirs.styles,
            dirs.contents,
            dirs.contentTheme,
            dirs.i18n
        ], { ignoreInitial: true })
        .on("all", (event, filePath) => handleFileChange(projectPath, filePath, event, resolvedPort, state));

    const server = await startServer(projectPath, resolvedPort, state);
    const devUrl = `http://localhost:${ resolvedPort }`;
    await openBrowser(devUrl);

    return createServerController({
        port: resolvedPort,
        server,
        watcher,
        wss: state.wss
    });
}

async function handleFileChange(projectPath, filePath, event, port, state)
{
    console.clear();
    console.log(defaultMessage);
    console.log(`
Server listening on port ${ port }
Development: ${ chalk.blueBright.underline(`http://localhost:` + port) }
            `);

    console.log(`${ chalk.bgMagenta(filePath) } is ${ chalk.blue(event) }!`);

    try
    {
        await updateI18N(projectPath, state);
    }
    catch (error)
    {
        console.error(`${ chalk.yellowBright(`Failed to reload i18n index: `) } ${ chalk.red(error) }`);
    }

    if (state.wss)
    {
        state.wss.clients.forEach((client) =>
        {
            client.send("reload");
        });
    }
}

async function updateI18N(projectPath, state)
{
    ({ locales: state.locales, index: state.i18nIndex } = await loadI18nIndex(projectPath, state.config?.i18n?.locales));
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

        let activeLocale = null;

        const segments = decodedPath.split("/").filter(Boolean);
        if (segments.length > 0 && state.locales.includes(segments[0]))
        {
            activeLocale = segments[0];
            decodedPath = "/" + segments.slice(1).join("/");
        }

        let reqPath = decodedPath === "" || decodedPath === "/" ? "/index.html" : (decodedPath.endsWith("/") ? decodedPath + "index.html" : decodedPath);

        let pagePath = path.join(projectPath, "pages", reqPath);
        if (!pagePath.endsWith(".html")) pagePath += ".html";

        const pageArgs = {
            pagePath: pagePath,
            categoryLinks: categoryLinks
        };

        if (await fileExists(pagePath))
        {
            let content = await buildComponent(
                pagePath,
                path.join(projectPath, "components"),
                path.join(projectPath, "mds"),
                [JSON.stringify(pageArgs)]
            );

            const relativeHtmlPath = path
                .relative(path.join(projectPath, "pages"), pagePath)
                .replace(/\\/g, "/");

            const defaultLocale = state.config?.i18n?.defaultLocale;
            if (!activeLocale && defaultLocale)
            {
                const jsonPath = state.i18nIndex.get(`${ defaultLocale }:${ relativeHtmlPath }`);
                if (jsonPath && await fileExists(jsonPath))
                {
                    try
                    {
                        const raw = await fsp.readFile(jsonPath, "utf8");
                        const translations = JSON.parse(raw);
                        content = applyI18n(content, translations);
                    }
                    catch (err)
                    {
                        console.error(
                            `Failed to apply default i18n for ${ relativeHtmlPath } (${ defaultLocale }) in dev:`,
                            err
                        );
                    }
                }
            }

            if (activeLocale)
            {
                let mergedTranslations = {};

                const defaultLocale = state.config?.i18n?.defaultLocale;
                const defaultJsonPath = defaultLocale
                    ? state.i18nIndex.get(`${ defaultLocale }:${ relativeHtmlPath }`)
                    : null;

                if (defaultJsonPath && await fileExists(defaultJsonPath))
                {
                    try
                    {
                        const raw = await fsp.readFile(defaultJsonPath, "utf8");
                        mergedTranslations = JSON.parse(raw);
                    }
                    catch (err)
                    {
                        console.error(`Default i18n parse failed (${ defaultLocale })`, err);
                    }
                }

                const localeJsonPath = state.i18nIndex.get(`${ activeLocale }:${ relativeHtmlPath }`);
                if (localeJsonPath && await fileExists(localeJsonPath))
                {
                    try
                    {
                        const raw = await fsp.readFile(localeJsonPath, "utf8");
                        const translations = JSON.parse(raw);
                        mergedTranslations = deepMerge(mergedTranslations, translations);
                    }
                    catch (err)
                    {
                        console.error(`Locale i18n parse failed (${ activeLocale })`, err);
                    }
                }

                content = applyI18n(content, mergedTranslations);
            }


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
Development: ${ chalk.blueBright(`http://localhost:` + port) }
            `);
    });

    state.wss = await createWSS(server);
    return server;
}
