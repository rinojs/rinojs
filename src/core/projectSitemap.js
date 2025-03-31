import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import { generateSitemapFile } from './sitemap.js';
import { getFilesRecursively } from './fileGetter.js';

export async function generateProjectSitemap (projectPath, config)
{
    if (!projectPath)
    {
        console.error(chalk.redBright(`Project path does not exist.`));
        return;
    }

    if (!config || !config.site?.url || !config.sitemap)
    {
        console.error(chalk.redBright(`Config or needed Config data for sitemap does not exist.`));
        return;
    }

    console.log(chalk.blueBright('Generating sitemap...'));

    let siteUrl = config.site.url;

    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1);

    const dist = config.dist ? path.resolve(projectPath, config.dist) : path.resolve(projectPath, './dist');
    const pagesDir = path.join(projectPath, 'pages');
    const contentsDir = path.join(projectPath, 'contents');
    const sitemapFilename = path.join(dist, 'sitemap.xml');
    const htmlFiles = getFilesRecursively(pagesDir, ['.html']);
    const htmlUrls = htmlFiles.map((file) =>
    {
        const relativePath = path.relative(pagesDir, file).replace(/\\/g, '/');
        return relativePath === 'index.html'
            ? `${siteUrl}/`
            : `${siteUrl}/${relativePath}`;
    });

    const contentUrls = [];

    if (fs.existsSync(contentsDir))
    {
        const categoryDirs = fs.readdirSync(contentsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const category of categoryDirs)
        {
            const categoryPath = path.join(contentsDir, category);
            const mdFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));

            for (const file of mdFiles)
            {
                const name = file.replace(/\.md$/, '');
                const url = `${siteUrl}/contents/${category}/${encodeURIComponent(name)}`;
                contentUrls.push(url);
            }
        }
    } else
    {
        console.warn(chalk.yellow("Skipped adding content pages to sitemap: 'contents/' folder not found."));
    }

    const combinedUrls = [...new Set([...htmlUrls, ...contentUrls, ...config.sitemap])];

    await generateSitemapFile(combinedUrls, sitemapFilename);

    console.log(chalk.greenBright('Sitemap is generated!'));
}
