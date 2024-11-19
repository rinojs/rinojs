import path from 'path';
import chalk from 'chalk';
import { generateSitemapFile } from './sitemap.js';
import { getFilesRecursively } from './fileGetter.js';

export async function generateProjectSitemap(projectPath, config)
{
    if (!projectPath)
    {
        console.error(chalk.redBright(`Project path does not exist.`));
        return;
    }

    if (!config || !config.site || !config.site.url || !config.sitemap)
    {
        console.error(chalk.redBright(`Config or needed Config data for sitemap does not exist.`));
        return;
    }

    console.log(chalk.blueBright('Generating sitemap...'));

    const siteUrl = config.site.url;
    const sitemap = config.sitemap;
    const dist = config && config.dist ? config.dist : "./dist";
    const dirs = {
        pages: path.join(projectPath, 'pages'),
        dist: path.resolve(projectPath, dist),
    };
    const sitemapFilename = path.join(dirs.dist, 'sitemap.xml');
    const htmlFiles = getFilesRecursively(dirs.pages, ['.html']);
    const htmlUrls = htmlFiles.map((file) =>
    {
        const relativePath = path.relative(dirs.pages, file).replace(/\\/g, '/');
        return relativePath === 'index.html'
            ? `${ siteUrl }/`
            : `${ siteUrl }/${ relativePath }`;
    });
    const sitemapList = [...new Set([...htmlUrls, ...sitemap])];

    await generateSitemapFile(sitemapList, sitemapFilename);

    console.log(chalk.greenBright('Sitemap is generated!'));
}