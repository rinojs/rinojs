import path from "path";
import { buildContent } from "../content.js";
import { buildContentList } from "../contentList.js";
import { fileExists } from "../fsHelper.js";
import { injectReload } from "../inject-reload.js";
import { buildCategoryLinks } from "./categoryLinks.js";

export function registerContentRoutes(app, projectPath, port)
{
    app.get(/^\/contents\/.+/, async (req, res) =>
    {
        const contentsDir = path.join(projectPath, "contents");
        const categoryLinks = await buildCategoryLinks(contentsDir);
        const slug = req.path.replace(/^\/contents\//, "");
        const decodedSlug = decodeURIComponent(slug);
        const mdPath = path.join(contentsDir, decodedSlug + ".md");

        if (!await fileExists(mdPath)) return res.status(404).send("Content not found");

        const [theme] = decodedSlug.split("/");
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

    app.get(/^\/contents-list\/.+/, async (req, res) =>
    {
        const contentsDir = path.join(projectPath, "contents");
        const categoryLinks = await buildCategoryLinks(contentsDir);
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
            contentsDir,
            templatePath,
            path.join(projectPath, "components"),
            path.join(projectPath, "mds"),
            10,
            [JSON.stringify(pageArgs)]
        );

        content = await injectReload(content, port);
        res.send(content);
    });
}
