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

export async function buildStaticSite (projectPath)
{
    if (!projectPath)
    {
        console.error(`Project path does not exist.`);
        return;
    }

    console.clear();
    console.log(defaultMessage);

    const config = await loadConfig(projectPath);

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
        console.log(chalk.red(`Cleared ${dirs.dist} \n`));
    }

    await copyFiles(dirs.public, dirs.dist);
    console.log(chalk.blue(`
Public files are copied to ${dirs.dist}
    `));

    const pages = await getFilesRecursively(dirs.pages, [".html"]);

    for (const pagePath of pages)
    {
        const relativePath = path.relative(dirs.pages, pagePath);
        const distPagePath = path.join(dirs.dist, relativePath);
        const distDir = path.dirname(distPagePath);

        if (!await dirExists(distDir))
        {
            await fsp.mkdir(distDir, { recursive: true });
        }

        const pageContent = await buildComponent(
            pagePath,
            dirs.components,
            dirs.mds,
            [pagePath]
        );

        await fsp.writeFile(distPagePath, pageContent, "utf8");

        console.log(chalk.greenBright(`Page generated: ${distPagePath}`));
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

        console.log(chalk.greenBright(`Script generated: ${distScriptPath}`));
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

        console.log(chalk.greenBright(`Typescript compiled: ${distScriptPath}`));
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

        console.log(chalk.greenBright(`Style generated: ${distStylePath}`));
    }

    if (await dirExists(dirs.contents))
    {
        const contentTemplatePath = path.join(dirs.contentTheme, "content.html");
        const contentListTemplatePath = path.join(dirs.contentTheme, "content-list.html");

        if (await fileExists(contentTemplatePath))
        {
            const contentFiles = await getFilesRecursively(dirs.contents, [".md"]);

            for (const mdPath of contentFiles)
            {
                const relativePath = path.relative(dirs.contents, mdPath);
                const category = relativePath.split(path.sep)[0];
                const html = await buildContent(mdPath, contentTemplatePath, dirs.components, dirs.mds, [contentTemplatePath]);

                const outputPath = path.join(
                    dirs.dist,
                    "contents",
                    relativePath.replace(/\.md$/, ".html")
                );

                await fse.ensureDir(path.dirname(outputPath));
                await fsp.writeFile(outputPath, html, "utf8");

                console.log(chalk.greenBright(`Content generated: ${outputPath}`));
            }
        }
        else
        {
            console.warn(chalk.yellow("Skipped content page generation: content.html not found."));
        }

        if (await fileExists(contentListTemplatePath))
        {
            const categoryDirs = (await fsp.readdir(dirs.contents, { withFileTypes: true }))
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const category of categoryDirs)
            {
                const categoryDir = path.join(dirs.contents, category);
                const files = (await fsp.readdir(categoryDir)).filter(f => f.endsWith(".md"));
                const pageCount = Math.ceil(files.length / 10);

                for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++)
                {
                    const contentListPath = `${category}-${pageIndex}`;
                    const html = await buildContentList(
                        contentListPath,
                        dirs.contents,
                        contentListTemplatePath,
                        dirs.components,
                        dirs.mds,
                        10,
                        [contentListTemplatePath]
                    );

                    const outputPath = path.join(
                        dirs.dist,
                        "contents-list",
                        category,
                        `${contentListPath}.html`
                    );

                    await fse.ensureDir(path.dirname(outputPath));
                    await fsp.writeFile(outputPath, html, "utf8");

                    console.log(chalk.greenBright(`Content list generated: ${outputPath}`));
                }
            }
        }
        else
        {
            console.warn(chalk.yellow("Skipped content list generation: content-list.html not found."));
        }
    }
    else
    {
        console.warn(chalk.yellow("Skipped content and content list generation: contents/ folder not found."));
    }

    console.log(chalk.blueBright("\nBuild process completed! \n"));
} 