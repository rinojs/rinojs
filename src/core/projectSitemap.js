import fs from 'fs';
import fsp from "fs/promises";
import path from 'path';
import chalk from 'chalk';
import { generateSitemap, generateSitemapFile } from './sitemap.js';
import { dirExists, getFilesRecursively } from './fsHelper.js';

function normalizeUrlPath(...parts)
{
    return parts.map(p => encodeURIComponent(p)).join('/');
}

async function getContentUrls(contentsDir, siteUrl)
{
    const urls = [];
    const themeDirs = fs.readdirSync(contentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const theme of themeDirs)
    {
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
                const url = `${ siteUrl }/contents/${ normalizeUrlPath(theme, category, name) }`;
                urls.push(url);
            }
        }
    }

    return urls;
}

export async function generateProjectSitemapFile(projectPath, config)
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

    let siteUrl = config.site.url.replace(/\/$/, '');
    const dist = config.dist ? path.resolve(projectPath, config.dist) : path.resolve(projectPath, './dist');
    const pagesDir = path.join(projectPath, 'pages');
    const contentsDir = path.join(projectPath, 'contents');
    const sitemapFilename = path.join(dist, 'sitemap.xml');

    if (!await dirExists(dist))
    {
        await fsp.mkdir(dist, { recursive: true });
    }

    const htmlFiles = (await getFilesRecursively(pagesDir, ['.html']))
        .filter(file => path.basename(file) !== '404.html');

    const htmlUrls = htmlFiles.map((file) =>
    {
        const relativePath = path.relative(pagesDir, file).replace(/\\/g, '/');
        return relativePath === 'index.html'
            ? `${ siteUrl }/`
            : `${ siteUrl }/${ relativePath }`;
    });

    const i18nConfig = config.i18n || {};
    const locales = Array.isArray(i18nConfig.locales) ? i18nConfig.locales : [];
    const defaultLocale = i18nConfig.defaultLocale;
    const localeHtmlUrls = [];

    if (locales.length > 0)
    {
        for (const file of htmlFiles)
        {
            const relativePath = path.relative(pagesDir, file).replace(/\\/g, '/');

            for (const locale of locales)
            {
                if (defaultLocale && locale === defaultLocale) continue;

                if (relativePath === 'index.html')
                {
                    localeHtmlUrls.push(`${ siteUrl }/${ locale }/`);
                }
                else
                {
                    localeHtmlUrls.push(`${ siteUrl }/${ locale }/${ relativePath }`);
                }
            }
        }
    }

    const contentUrls = fs.existsSync(contentsDir)
        ? await getContentUrls(contentsDir, siteUrl)
        : [];

    if (!contentUrls.length)
    {
        console.warn(chalk.yellow("Skipped adding content pages to sitemap: 'contents/' folder not found or empty."));
    }

    const combinedUrls = [...new Set([...htmlUrls, ...localeHtmlUrls, ...contentUrls, ...config.sitemap])];

    await generateSitemapFile(combinedUrls, sitemapFilename);
    console.log(chalk.greenBright('Sitemap is generated!'));
}

export async function generateProjectSitemap(projectPath, config)
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

    let siteUrl = config.site.url.replace(/\/$/, '');
    const pagesDir = path.join(projectPath, 'pages');
    const contentsDir = path.join(projectPath, 'contents');

    const htmlFiles = (await getFilesRecursively(pagesDir, ['.html']))
        .filter(file => path.basename(file) !== '404.html');

    const htmlUrls = htmlFiles.map((file) =>
    {
        const relativePath = path.relative(pagesDir, file).replace(/\\/g, '/');
        return relativePath === 'index.html'
            ? `${ siteUrl }/`
            : `${ siteUrl }/${ relativePath }`;
    });

    const i18nConfig = config.i18n || {};
    const locales = Array.isArray(i18nConfig.locales) ? i18nConfig.locales : [];
    const defaultLocale = i18nConfig.defaultLocale;
    const localeHtmlUrls = [];

    if (locales.length > 0)
    {
        for (const file of htmlFiles)
        {
            const relativePath = path.relative(pagesDir, file).replace(/\\/g, '/');

            for (const locale of locales)
            {
                if (defaultLocale && locale === defaultLocale) continue;

                if (relativePath === 'index.html')
                {
                    localeHtmlUrls.push(`${ siteUrl }/${ locale }/`);
                }
                else
                {
                    localeHtmlUrls.push(`${ siteUrl }/${ locale }/${ relativePath }`);
                }
            }
        }
    }

    const contentUrls = fs.existsSync(contentsDir)
        ? await getContentUrls(contentsDir, siteUrl)
        : [];

    if (!contentUrls.length)
    {
        console.warn(chalk.yellow("Skipped adding content pages to sitemap: 'contents/' folder not found or empty."));
    }

    const combinedUrls = [...new Set([...htmlUrls, ...localeHtmlUrls, ...contentUrls, ...config.sitemap])];
    return await generateSitemap(combinedUrls);
}
