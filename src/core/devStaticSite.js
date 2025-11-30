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
import { fileExists, dirExists } from "./fsHelper.js"
import { generateProjectSitemap } from './projectSitemap.js';
import { generateProjectAtomFeed, generateProjectRSSFeed } from './projectFeed.js';
import { loadI18nIndex, applyI18n } from "./i18n.js"

let wss = null;
let config = null;
let locales = [];
let i18nIndex = new Map();

export async function devStaticSite(projectPath)
{
    if (!projectPath)
    {
        console.error(`Project path does not exist.`);
        return;
    }

    config = await loadConfig(projectPath);
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
        contentTheme: path.join(projectPath, "content-theme"),
        i18n: path.join(projectPath, "i18n"),
    };

    try
    {
        await updateI18N(projectPath);
    }
    catch (error)
    {
        console.error(`${ chalk.yellowBright(`Failed to reload i18n index: `) } ${ chalk.red(error) }`);
    }

    chokidar
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
        .on("all", (event, filePath) => handleFileChange(projectPath, filePath, event, resolvedPort));

    await startServer(projectPath, resolvedPort);
    const devUrl = `http://localhost:${ resolvedPort }`;
    await openBrowser(devUrl);
}

async function handleFileChange(projectPath, filePath, event, port)
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
        await updateI18N(projectPath);
    }
    catch (error)
    {
        console.error(`${ chalk.yellowBright(`Failed to reload i18n index: `) } ${ chalk.red(error) }`);
    }

    if (wss)
    {
        wss.clients.forEach((client) =>
        {
            client.send("reload");
        });
    }
}

async function updateI18N(projectPath)
{
    ({ locales, index: i18nIndex } = await loadI18nIndex(projectPath, config?.i18n?.locales));
}

async function startServer(projectPath, port)
{
    const app = express();
    app.use(cors());
    app.use(express.static(path.join(projectPath, "public")));

    app.get("/scripts/*.js", async (req, res) =>
    {
        const requestPath = decodeURIComponent(req.path).replace("/scripts", "");
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
        const requestPath = decodeURIComponent(req.path).replace("/styles", "");
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
        const categoryLinks = {};
        const contentDir = path.join(projectPath, "contents");

        if (await dirExists(contentDir))
        {
            const themeDirs = (await fsp.readdir(contentDir, { withFileTypes: true }))
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const theme of themeDirs)
            {
                const themeDir = path.join(contentDir, theme);
                const categoryDirs = (await fsp.readdir(themeDir, { withFileTypes: true }))
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                for (const category of categoryDirs)
                {
                    const categoryDir = path.join(themeDir, category);
                    const files = (await fsp.readdir(categoryDir)).filter(f => f.endsWith(".md"));
                    if (files.length > 0)
                    {
                        const path = `/contents-list/${ theme }/${ category }/${ category }-1`;
                        categoryLinks[`${ theme }/${ category }`] = path;
                    }
                }
            }
        }

        const slug = req.path.replace(/^\/contents\//, "");
        const decodedSlug = decodeURIComponent(slug);
        const mdPath = path.join(projectPath, "contents", decodedSlug + ".md");

        if (!await fileExists(mdPath)) return res.status(404).send("Content not found");

        const parts = decodedSlug.split("/");
        const theme = parts[0];
        const category = parts[1];
        const templatePath = path.join(projectPath, "content-theme", theme, "content.html");
        const pageArgs = {
            pagePath: templatePath,
            categoryLinks
        };

        let content = await buildContent(
            mdPath,
            templatePath,
            path.join(projectPath, "components"),
            path.join(projectPath, "mds"),
            [JSON.stringify(pageArgs)]
        );
        content = await injectReload(content, port);
        res.send(content);
    });

    app.get("/contents-list/*", async (req, res) =>
    {
        const categoryLinks = {};
        const contentDir = path.join(projectPath, "contents");

        if (await dirExists(contentDir))
        {
            const themeDirs = (await fsp.readdir(contentDir, { withFileTypes: true }))
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const theme of themeDirs)
            {
                const themeDir = path.join(contentDir, theme);
                const categoryDirs = (await fsp.readdir(themeDir, { withFileTypes: true }))
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                for (const category of categoryDirs)
                {
                    const categoryDir = path.join(themeDir, category);
                    const files = (await fsp.readdir(categoryDir)).filter(f => f.endsWith(".md"));
                    if (files.length > 0)
                    {
                        const path = `/contents-list/${ theme }/${ category }/${ category }-1`;
                        categoryLinks[`${ theme }/${ category }`] = path;
                    }
                }
            }
        }

        const slug = req.path.replace(/^\/contents-list\//, "");
        const decodedSlug = decodeURIComponent(slug);
        const [theme, category, pageName] = decodedSlug.split("/");
        const templatePath = path.join(projectPath, "content-theme", theme, "content-list.html");
        const pageArgs = {
            pagePath: templatePath,
            categoryLinks
        };

        let content = await buildContentList(
            `${ theme }/${ category }/${ pageName }`,
            path.join(projectPath, "contents"),
            templatePath,
            path.join(projectPath, "components"),
            path.join(projectPath, "mds"),
            10,
            [JSON.stringify(pageArgs)]
        );
        content = await injectReload(content, port);
        res.send(content);
    });

    app.get("/sitemap.xml", async (req, res) =>
    {
        const content = await generateProjectSitemap(projectPath, config);
        res.setHeader("Content-Type", "application/xml");
        res.send(content);
    });

    app.get("/rss.xml", async (req, res) =>
    {
        const content = await generateProjectRSSFeed(projectPath, config);
        res.setHeader("Content-Type", "application/xml");
        res.send(content);
    });

    app.get("/atom.xml", async (req, res) =>
    {
        const content = await generateProjectAtomFeed(projectPath, config);
        res.setHeader("Content-Type", "application/xml");
        res.send(content);
    });


    app.get("*", async (req, res) =>
    {
        const categoryLinks = {};
        const contentDir = path.join(projectPath, "contents");

        if (await dirExists(contentDir))
        {
            const themeDirs = (await fsp.readdir(contentDir, { withFileTypes: true }))
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const theme of themeDirs)
            {
                const themeDir = path.join(contentDir, theme);
                const categoryDirs = (await fsp.readdir(themeDir, { withFileTypes: true }))
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                for (const category of categoryDirs)
                {
                    const categoryDir = path.join(themeDir, category);
                    const files = (await fsp.readdir(categoryDir)).filter(f => f.endsWith(".md"));
                    if (files.length > 0)
                    {
                        const path = `/contents-list/${ theme }/${ category }/${ category }-1`;
                        categoryLinks[`${ theme }/${ category }`] = path;
                    }
                }
            }
        }

        let decodedPath = decodeURIComponent(req.path);

        let activeLocale = null;

        const segments = decodedPath.split("/").filter(Boolean);
        if (segments.length > 0 && locales.includes(segments[0]))
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

            const defaultLocale = config?.i18n?.defaultLocale;
            if (!activeLocale && defaultLocale)
            {
                const jsonPath = i18nIndex.get(`${ defaultLocale }:${ relativeHtmlPath }`);
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

                const defaultLocale = config?.i18n?.defaultLocale;
                const defaultJsonPath = defaultLocale
                    ? i18nIndex.get(`${ defaultLocale }:${ relativeHtmlPath }`)
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

                const localeJsonPath = i18nIndex.get(`${ activeLocale }:${ relativeHtmlPath }`);
                if (localeJsonPath && await fileExists(localeJsonPath))
                {
                    try
                    {
                        const raw = await fsp.readFile(localeJsonPath, "utf8");
                        const translations = JSON.parse(raw);
                        mergedTranslations = { ...mergedTranslations, ...translations };
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

    wss = await createWSS(server);
}
