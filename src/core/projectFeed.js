import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { generateRSSFeedFile } from './rssFeed.js';
import { generateAtomFeedFile } from './atomFeed.js';

export async function generateContentFeeds (projectPath, config)
{
    if (!projectPath)
    {
        console.error(chalk.redBright(`Project path does not exist.`));
        return;
    }

    if (!config || !config.site?.url || !config.dist)
    {
        console.error(chalk.redBright(`Missing site or dist config for feed generation.`));
        return;
    }

    const siteUrl = config.site.url.endsWith('/') ? config.site.url.slice(0, -1) : config.site.url;
    const contentsDir = path.join(projectPath, 'contents');
    const distDir = path.resolve(projectPath, config.dist);

    if (!fs.existsSync(contentsDir))
    {
        console.warn(chalk.yellow("Skipped feed generation: contents folder not found."));
        return;
    }

    const contentItems = [];
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
            const title = name.replace(/^\d+-/, '').replace(/-/g, ' ');

            contentItems.push({ title, link: url });
        }
    }

    if (contentItems.length === 0)
    {
        console.warn(chalk.yellow("No content items found for feed generation."));
        return;
    }

    const rssPath = path.join(distDir, 'rss.xml');
    const atomPath = path.join(distDir, 'atom.xml');

    await generateRSSFeedFile(contentItems, rssPath, siteUrl);
    await generateAtomFeedFile(contentItems, atomPath, siteUrl);

    console.log(chalk.greenBright("RSS and Atom feeds generated!"));
}