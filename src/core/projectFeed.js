import fs from "fs";
import fsp from "fs/promises";
import path from 'path';
import chalk from 'chalk';
import { generateRSSFeedFile, generateRSSFeed } from './rssFeed.js';
import { generateAtomFeedFile, generateAtomFeed } from './atomFeed.js';
import { dirExists, fileExists } from './fsHelper.js';

function normalizeUrlPath (...parts)
{
    return parts.map(p => encodeURIComponent(p)).join('/');
}

async function getContentItemsByTheme (contentsDir, siteUrl)
{
    const themeItems = {};

    const themeDirs = fs.readdirSync(contentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const theme of themeDirs)
    {
        const items = [];
        const themePath = path.join(contentsDir, theme);

        const categoryDirs = fs.readdirSync(themePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const category of categoryDirs)
        {
            const categoryPath = path.join(themePath, category);
            const mdFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));

            for (const file of mdFiles)
            {
                const name = file.replace(/\.md$/, '');
                const title = name.replace(/^\d+-/, '').replace(/-/g, ' ');
                const url = `${siteUrl}/contents/${normalizeUrlPath(theme, category, name)}`;
                items.push({ title, link: url });
            }
        }

        if (items.length > 0)
        {
            themeItems[theme] = items;
        }
    }

    return themeItems;
}


export async function generateProjectFeedFiles (projectPath, config)
{
    if (!projectPath) return console.error(chalk.redBright(`Project path does not exist.`));
    if (!config || !config.site?.url) return console.error(chalk.redBright(`Missing config data for feed generation.`));

    const dist = config.dist || "./dist";
    const siteUrl = config.site.url.replace(/\/$/, '');
    const contentsDir = path.join(projectPath, 'contents');
    const distDir = path.resolve(projectPath, dist);

    if (!await fileExists(contentsDir))
    {
        console.warn(chalk.yellow("Skipped feed generation: contents folder not found."));
        return;
    }

    if (!await dirExists(distDir))
    {
        await fsp.mkdir(distDir, { recursive: true });
    }

    const themeFeeds = await getContentItemsByTheme(contentsDir, siteUrl);

    const allItems = [];

    for (const [theme, items] of Object.entries(themeFeeds))
    {
        allItems.push(...items);

        const rssPath = path.join(distDir, `rss-${theme}.xml`);
        const atomPath = path.join(distDir, `atom-${theme}.xml`);

        await generateRSSFeedFile(items, rssPath, siteUrl);
        await generateAtomFeedFile(items, atomPath, siteUrl);

        console.log(chalk.green(`RSS and Atom feeds generated for theme: ${theme}`));
    }

    if (allItems.length > 0)
    {
        await generateRSSFeedFile(allItems, path.join(distDir, 'rss.xml'), siteUrl);
        await generateAtomFeedFile(allItems, path.join(distDir, 'atom.xml'), siteUrl);
        console.log(chalk.greenBright("Unified RSS and Atom feeds generated!"));
    }
    else
    {
        console.warn(chalk.yellow("No content items found for feed generation."));
    }
}


export async function generateProjectAtomFeed (projectPath, config, theme = "")
{
    if (!projectPath || !config?.site?.url)
    {
        console.error(chalk.redBright(`Missing project path or config.`));
        return;
    }

    const siteUrl = config.site.url.replace(/\/$/, '');
    const contentsDir = path.join(projectPath, 'contents');

    if (!await fileExists(contentsDir))
    {
        console.warn(chalk.yellow("Skipped feed generation: contents folder not found."));
        return;
    }

    const contentItemsByTheme = await getContentItemsByTheme(contentsDir, siteUrl);
    const contentItems = theme
        ? contentItemsByTheme[theme] || Object.values(contentItemsByTheme).flat()
        : Object.values(contentItemsByTheme).flat();

    if (contentItems.length === 0)
    {
        console.warn(chalk.yellow(`No content items found for Atom feed generation${theme ? ` (theme: ${theme})` : ""}.`));
        return;
    }

    return await generateAtomFeed(contentItems, siteUrl);
}

export async function generateProjectRSSFeed (projectPath, config, theme = "")
{
    if (!projectPath || !config?.site?.url)
    {
        console.error(chalk.redBright(`Missing project path or config.`));
        return;
    }

    const siteUrl = config.site.url.replace(/\/$/, '');
    const contentsDir = path.join(projectPath, 'contents');

    if (!await fileExists(contentsDir))
    {
        console.warn(chalk.yellow("Skipped feed generation: contents folder not found."));
        return;
    }

    const contentItemsByTheme = await getContentItemsByTheme(contentsDir, siteUrl);
    const contentItems = theme
        ? contentItemsByTheme[theme] || Object.values(contentItemsByTheme).flat()
        : Object.values(contentItemsByTheme).flat();

    if (contentItems.length === 0)
    {
        console.warn(chalk.yellow(`No content items found for RSS feed generation${theme ? ` (theme: ${theme})` : ""}.`));
        return;
    }

    return await generateRSSFeed(contentItems, siteUrl);
}