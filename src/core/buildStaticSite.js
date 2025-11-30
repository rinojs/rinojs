import fse from "fs-extra";
import fsp from "fs/promises";
import path from "path";
import chalk from "chalk";
import CleanCSS from "clean-css";
import { defaultMessage } from "./consoleMessages.js";
import { loadConfig } from "./configLoader.js";
import { fileExists, dirExists, getFilesRecursively } from "./fsHelper.js"
import { copyFiles } from "./copyFiles.js";
import { buildComponent } from "./component.js";
import { bundleJS } from "./bundleJS.js";
import { bundleTS } from "./bundleTS.js";
import { bundleCSS } from "./bundleCSS.js";
import { buildContent } from "./content.js";
import { buildContentList } from "./contentList.js";
import { loadI18nIndex, applyI18n } from "./i18n.js"

export async function buildStaticSite(projectPath)
{
    if (!projectPath)
    {
        console.error(`Project path does not exist.`);
        return;
    }

    console.clear();
    console.log(defaultMessage);

    const config = await loadConfig(projectPath);
    const { locales, index: i18nIndex } = await loadI18nIndex(projectPath, config?.i18n?.locales);
    const dirs = {
        pages: path.join(projectPath, "pages"),
        components: path.join(projectPath, "components"),
        public: path.join(projectPath, "public"),
        scripts: path.join(projectPath, "scripts/export"),
        styles: path.join(projectPath, "styles/export"),
        mds: path.join(projectPath, "mds"),
        contents: path.join(projectPath, "contents"),
        contentTheme: path.join(projectPath, "content-theme"),
        dist: config.dist ? path.resolve(projectPath, config.dist) : path.resolve(projectPath, "./dist"),
    };

    if (await dirExists(dirs.dist))
    {
        await fse.emptyDir(dirs.dist);
        console.log(chalk.red(`Cleared ${ dirs.dist } \n`));
    }

    await copyFiles(dirs.public, dirs.dist);
    console.log(chalk.blue(`
Public files are copied to ${ dirs.dist }
    `));

    const categoryLinks = {};

    if (await dirExists(dirs.contents))
    {
        const themeDirs = (await fsp.readdir(dirs.contents, { withFileTypes: true }))
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const theme of themeDirs)
        {
            const themeDir = path.join(dirs.contents, theme);
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

    const pages = await getFilesRecursively(dirs.pages, [".html"]);

    for (const pagePath of pages)
    {
        const relativePath = path
            .relative(dirs.pages, pagePath)
            .replace(/\\/g, "/");

        const distPagePath = path.join(dirs.dist, relativePath);
        const distDir = path.dirname(distPagePath);

        if (!await dirExists(distDir))
        {
            await fsp.mkdir(distDir, { recursive: true });
        }

        const pageArgs = {
            pagePath: pagePath,
            categoryLinks: categoryLinks
        };

        const basePageContent = await buildComponent(
            pagePath,
            dirs.components,
            dirs.mds,
            [JSON.stringify(pageArgs)]
        );

        const defaultLocale = config?.i18n?.defaultLocale;
        const canUseDefaultLocale =
            !!defaultLocale && locales.includes(defaultLocale);

        let finalBaseContent = basePageContent;
        let defaultTranslations = null;

        if (canUseDefaultLocale)
        {
            const defaultJsonPath = i18nIndex.get(`${ defaultLocale }:${ relativePath }`);

            if (defaultJsonPath && await fileExists(defaultJsonPath))
            {
                try
                {
                    const raw = await fsp.readFile(defaultJsonPath, "utf8");
                    defaultTranslations = JSON.parse(raw);
                    finalBaseContent = applyI18n(basePageContent, defaultTranslations);
                }
                catch (error)
                {
                    console.error(
                        chalk.red(`Failed to apply default i18n for ${ relativePath } (${ defaultLocale }):`),
                        error
                    );
                    defaultTranslations = null;
                    finalBaseContent = basePageContent;
                }
            }
        }

        await fsp.writeFile(distPagePath, finalBaseContent, "utf8");
        console.log(chalk.greenBright(`Page generated: ${ distPagePath }`));

        for (const locale of locales)
        {
            if (defaultLocale && locale === defaultLocale) continue;

            let mergedTranslations = {};

            if (defaultTranslations && canUseDefaultLocale)
            {
                mergedTranslations = { ...defaultTranslations };
            }
            else if (defaultLocale && !defaultTranslations && canUseDefaultLocale)
            {
                const fallbackDefaultJsonPath = i18nIndex.get(`${ defaultLocale }:${ relativePath }`);
                if (fallbackDefaultJsonPath && await fileExists(fallbackDefaultJsonPath))
                {
                    try
                    {
                        const raw = await fsp.readFile(fallbackDefaultJsonPath, "utf8");
                        defaultTranslations = JSON.parse(raw);
                        mergedTranslations = { ...defaultTranslations };
                    }
                    catch (error)
                    {
                        console.error(
                            chalk.red(`Failed to load default i18n (lazy) for ${ relativePath } (${ defaultLocale }):`),
                            error
                        );
                        defaultTranslations = null;
                    }
                }
            }

            const jsonPath = i18nIndex.get(`${ locale }:${ relativePath }`);
            if (jsonPath && await fileExists(jsonPath))
            {
                try
                {
                    const raw = await fsp.readFile(jsonPath, "utf8");
                    const localeTranslations = JSON.parse(raw);
                    mergedTranslations = { ...mergedTranslations, ...localeTranslations };
                }
                catch (error)
                {
                    console.error(
                        chalk.red(`Failed to apply i18n for ${ relativePath } (${ locale }):`),
                        error
                    );
                }
            }

            const localizedContent =
                Object.keys(mergedTranslations).length > 0
                    ? applyI18n(basePageContent, mergedTranslations)
                    : basePageContent;

            const localizedDistPath = path.join(dirs.dist, locale, relativePath);
            await fse.ensureDir(path.dirname(localizedDistPath));
            await fsp.writeFile(localizedDistPath, localizedContent, "utf8");

            console.log(chalk.greenBright(`Page generated: ${ localizedDistPath }`));
        }
    }


    const scripts = await getFilesRecursively(dirs.scripts, [".js", ".mjs"]);

    for (const scriptPath of scripts)
    {
        const relativePath = path.relative(dirs.scripts, scriptPath);
        const distScriptPath = path.join(dirs.dist, "scripts", relativePath);
        const distDir = path.dirname(distScriptPath);

        if (!await dirExists(distDir))
        {
            await fsp.mkdir(distDir, { recursive: true });
        }

        const scriptContent = await bundleJS(
            scriptPath,
            path.basename(scriptPath, path.extname(scriptPath))
        );

        await fsp.writeFile(distScriptPath, scriptContent, "utf8");

        console.log(chalk.greenBright(`Script generated: ${ distScriptPath }`));
    }

    const tsScripts = await getFilesRecursively(dirs.scripts, [".ts"]);

    for (const scriptPath of tsScripts)
    {
        const relativePath = path.relative(dirs.scripts, scriptPath);
        const distScriptPath = path.join(dirs.dist, "scripts", relativePath);
        const distDir = path.dirname(distScriptPath);

        if (!await dirExists(distDir))
        {
            await fsp.mkdir(distDir, { recursive: true });
        }

        const scriptContent = await bundleTS(
            scriptPath,
            projectPath,
            path.basename(scriptPath, path.extname(scriptPath))
        );

        await fsp.writeFile(distScriptPath.replace(".ts", ".js"), scriptContent, "utf8");

        console.log(chalk.greenBright(`Typescript compiled: ${ distScriptPath }`));
    }

    const styles = await getFilesRecursively(dirs.styles, [".css"]);
    const cccs = new CleanCSS();

    for (const stylePath of styles)
    {
        const relativePath = path.relative(dirs.styles, stylePath);
        const distStylePath = path.join(dirs.dist, "styles", relativePath);
        const distDir = path.dirname(distStylePath);

        if (!await dirExists(distDir))
        {
            await fsp.mkdir(distDir, { recursive: true });
        }

        let styleContent = await bundleCSS(
            await fsp.readFile(stylePath, "utf8"),
            path.dirname(stylePath)
        );

        styleContent = cccs.minify(styleContent).styles;
        await fsp.writeFile(distStylePath, styleContent, "utf8");

        console.log(chalk.greenBright(`Style generated: ${ distStylePath }`));
    }


    if (await dirExists(dirs.contentTheme))
    {
        const themeDirs = (await fsp.readdir(dirs.contentTheme, { withFileTypes: true }))
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const theme of themeDirs)
        {
            const themeContentPath = path.join(dirs.contents, theme);
            const themeTemplateDir = path.join(dirs.contentTheme, theme);
            const contentTemplatePath = path.join(themeTemplateDir, "content.html");
            const contentListTemplatePath = path.join(themeTemplateDir, "content-list.html");
            const themeExists = await dirExists(themeContentPath);
            const templateExists = await fileExists(contentTemplatePath) && await fileExists(contentListTemplatePath);

            if (!themeExists || !templateExists) continue;

            const contentFiles = await getFilesRecursively(themeContentPath, [".md"]);

            let pageArgs = {
                pagePath: contentTemplatePath,
                categoryLinks: categoryLinks
            }

            for (const mdPath of contentFiles)
            {
                const html = await buildContent(
                    mdPath,
                    contentTemplatePath,
                    dirs.components,
                    dirs.mds,
                    [JSON.stringify(pageArgs)]
                );

                const outputPath = path.join(
                    dirs.dist,
                    "contents",
                    path.relative(dirs.contents, mdPath).replace(/\.md$/, ".html")
                );

                await fse.ensureDir(path.dirname(outputPath));
                await fsp.writeFile(outputPath, html, "utf8");
                console.log(chalk.greenBright(`Content generated: ${ outputPath }`));
            }

            const categoryDirs = (await fsp.readdir(themeContentPath, { withFileTypes: true }))
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            pageArgs = {
                pagePath: contentListTemplatePath,
                categoryLinks: categoryLinks
            }

            for (const category of categoryDirs)
            {
                const categoryPath = path.join(themeContentPath, category);
                const files = (await fsp.readdir(categoryPath)).filter(f => f.endsWith(".md"));
                const pageCount = Math.ceil(files.length / 10);

                for (let i = 1; i <= pageCount; i++)
                {
                    const pageName = `${ category }-${ i }`;
                    const html = await buildContentList(
                        `${ theme }/${ category }/${ pageName }`,
                        dirs.contents,
                        contentListTemplatePath,
                        dirs.components,
                        dirs.mds,
                        10,
                        [JSON.stringify(pageArgs)]
                    );

                    const outputPath = path.join(
                        dirs.dist,
                        "contents-list",
                        theme,
                        category,
                        `${ pageName }.html`
                    );

                    await fse.ensureDir(path.dirname(outputPath));
                    await fsp.writeFile(outputPath, html, "utf8");

                    console.log(chalk.greenBright(`Content list generated: ${ outputPath }`));
                }
            }
        }
    }


    console.log(chalk.blueBright("\nBuild process completed! \n"));
} 