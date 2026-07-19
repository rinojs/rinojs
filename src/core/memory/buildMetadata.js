import { generateProjectAtomFeed, generateProjectRSSFeed } from "../projectFeed.js";
import { generateProjectSitemap } from "../projectSitemap.js";

export async function buildMemoryMetadata(context, write)
{
    const { projectPath, config } = context;
    const outputs = [
        ["/sitemap.xml", await generateProjectSitemap(projectPath, config)],
        ["/rss.xml", await generateProjectRSSFeed(projectPath, config)],
        ["/atom.xml", await generateProjectAtomFeed(projectPath, config)]
    ];

    for (const [url, body] of outputs)
    {
        if (body) write(url, body, "application/xml; charset=utf-8");
    }
}
