import fse from "fs-extra";
import fsp from "fs/promises";
import path from "path";
import chalk from "chalk";
import { buildContent } from "../content.js";
import { buildContentList } from "../contentList.js";
import { fileExists, dirExists, getFilesRecursively } from "../fsHelper.js";

export async function buildStaticContentPages(dirs, categoryLinks)
{
    if (!await dirExists(dirs.contentTheme))
    {
        return;
    }

    const themeDirs = (await fsp.readdir(dirs.contentTheme, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const theme of themeDirs)
    {
        await buildStaticThemeContent(theme, dirs, categoryLinks);
    }
}

async function buildStaticThemeContent(theme, dirs, categoryLinks)
{
    const themeContentPath = path.join(dirs.contents, theme);
    const themeTemplateDir = path.join(dirs.contentTheme, theme);
    const contentTemplatePath = path.join(themeTemplateDir, "content.html");
    const contentListTemplatePath = path.join(themeTemplateDir, "content-list.html");
    const themeExists = await dirExists(themeContentPath);
    const templateExists = await fileExists(contentTemplatePath) && await fileExists(contentListTemplatePath);

    if (!themeExists || !templateExists) return;

    await buildContentFiles(themeContentPath, contentTemplatePath, dirs, categoryLinks);
    await buildContentLists(theme, themeContentPath, contentListTemplatePath, dirs, categoryLinks);
}

async function buildContentFiles(themeContentPath, contentTemplatePath, dirs, categoryLinks)
{
    const contentFiles = await getFilesRecursively(themeContentPath, [".md"]);
    const pageArgs = {
        pagePath: contentTemplatePath,
        categoryLinks: categoryLinks
    };

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
}

async function buildContentLists(theme, themeContentPath, contentListTemplatePath, dirs, categoryLinks)
{
    const categoryDirs = (await fsp.readdir(themeContentPath, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    const pageArgs = {
        pagePath: contentListTemplatePath,
        categoryLinks: categoryLinks
    };

    for (const category of categoryDirs)
    {
        const categoryPath = path.join(themeContentPath, category);
        const files = (await fsp.readdir(categoryPath)).filter(file => file.endsWith(".md"));
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
