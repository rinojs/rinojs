import fsp from "node:fs/promises";
import path from "node:path";
import { buildContent } from "../content.js";
import { buildContentList } from "../contentList.js";
import { dirExists, fileExists, getFilesRecursively } from "../fsHelper.js";

export async function buildMemoryContent(context, write, options = {})
{
    const { dirs, categoryLinks } = context;
    if (!await dirExists(dirs.contentTheme)) return;
    const selected = options.themes ? new Set(options.themes) : null;
    const themes = (await fsp.readdir(dirs.contentTheme, { withFileTypes: true }))
        .filter(item => item.isDirectory() && (!selected || selected.has(item.name)));

    for (const { name: theme } of themes)
    {
        const contentRoot = path.join(dirs.contents, theme);
        const templateRoot = path.join(dirs.contentTheme, theme);
        const contentTemplate = path.join(templateRoot, "content.html");
        const listTemplate = path.join(templateRoot, "content-list.html");
        if (!await dirExists(contentRoot) || !await fileExists(contentTemplate) || !await fileExists(listTemplate)) continue;

        const args = template => [JSON.stringify({ pagePath: template, categoryLinks })];
        for (const source of await getFilesRecursively(contentRoot, [".md"]))
        {
            const relative = path.relative(dirs.contents, source).replace(/\\/g, "/").replace(/\.md$/, ".html");
            const html = await buildContent(source, contentTemplate, dirs.components, dirs.mds, args(contentTemplate));
            write(`/contents/${ relative }`, html, "text/html; charset=utf-8");
        }

        const categories = (await fsp.readdir(contentRoot, { withFileTypes: true })).filter(item => item.isDirectory());
        for (const { name: category } of categories)
        {
            const files = (await fsp.readdir(path.join(contentRoot, category))).filter(file => file.endsWith(".md"));
            for (let page = 1; page <= Math.ceil(files.length / 10); page++)
            {
                const pageName = `${ category }-${ page }`;
                const slug = `${ theme }/${ category }/${ pageName }`;
                const html = await buildContentList(slug, dirs.contents, listTemplate, dirs.components, dirs.mds, 10, args(listTemplate));
                write(`/contents-list/${ slug }.html`, html, "text/html; charset=utf-8");
            }
        }
    }
}
