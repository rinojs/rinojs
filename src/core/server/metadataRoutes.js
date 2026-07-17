import { generateProjectAtomFeed, generateProjectRSSFeed } from "../projectFeed.js";
import { generateProjectSitemap } from "../projectSitemap.js";

export function registerMetadataRoutes(app, projectPath, config)
{
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
}
