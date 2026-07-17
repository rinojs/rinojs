import fse from "fs-extra";
import chalk from "chalk";
import { defaultMessage } from "./consoleMessages.js";
import { loadConfig } from "./configLoader.js";
import { dirExists } from "./fsHelper.js"
import { copyFiles } from "./copyFiles.js";
import { loadI18nIndex } from "./i18n.js"
import { buildCategoryLinks } from "./server/categoryLinks.js";
import { buildStaticAssets } from "./staticBuild/assets.js";
import { buildStaticContentPages } from "./staticBuild/content.js";
import { getStaticBuildDirs } from "./staticBuild/dirs.js";
import { buildStaticPages } from "./staticBuild/pages.js";

export async function buildStaticSite(projectPath)
{
    if (!projectPath)
    {
        console.error(`Project path does not exist.`);
        return;
    }

    console.clear();
    console.log(defaultMessage);

    const config = await loadConfig(projectPath);
    const { locales, index: i18nIndex } = await loadI18nIndex(projectPath, config?.i18n?.locales);
    const dirs = getStaticBuildDirs(projectPath, config);

    if (await dirExists(dirs.dist))
    {
        await fse.emptyDir(dirs.dist);
        console.log(chalk.red(`Cleared ${ dirs.dist } \n`));
    }

    await copyFiles(dirs.public, dirs.dist);
    console.log(chalk.blue(`
Public files are copied to ${ dirs.dist }
    `));

    const categoryLinks = await buildCategoryLinks(dirs.contents);

    await buildStaticPages({ dirs, config, locales, i18nIndex, categoryLinks });
    await buildStaticAssets(projectPath, dirs);
    await buildStaticContentPages(dirs, categoryLinks);


    console.log(chalk.blueBright("\nBuild process completed! \n"));
} 
