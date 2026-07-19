import fse from "fs-extra";
import fsp from "fs/promises";
import path from "path";
import chalk from "chalk";
import { buildComponent } from "../component.js";
import { deepMerge } from "../deepMerge.js";
import { fileExists, dirExists, getFilesRecursively } from "../fsHelper.js";
import { applyI18n } from "../i18n.js";

export async function buildStaticPages({ dirs, config, locales, i18nIndex, categoryLinks })
{
    const pages = await getFilesRecursively(dirs.pages, [".html"]);

    for (const pagePath of pages)
    {
        await buildStaticPage({ pagePath, dirs, config, locales, i18nIndex, categoryLinks });
    }
}

async function buildStaticPage({ pagePath, dirs, config, locales, i18nIndex, categoryLinks })
{
    const relativePath = path
        .relative(dirs.pages, pagePath)
        .replace(/\\/g, "/");

    const distPagePath = path.join(dirs.dist, relativePath);
    const distDir = path.dirname(distPagePath);

    if (!await dirExists(distDir))
    {
        await fsp.mkdir(distDir, { recursive: true });
    }

    const pageArgs = {
        pagePath: pagePath,
        categoryLinks: categoryLinks
    };

    const basePageContent = await buildComponent(
        pagePath,
        dirs.components,
        dirs.mds,
        [JSON.stringify(pageArgs)]
    );

    const defaultLocale = config?.i18n?.defaultLocale;
    const canUseDefaultLocale =
        !!defaultLocale && locales.includes(defaultLocale);

    let finalBaseContent = basePageContent;
    let defaultTranslations = null;

    if (canUseDefaultLocale)
    {
        const defaultJsonPath = i18nIndex.get(`${ defaultLocale }:${ relativePath }`);

        if (defaultJsonPath && await fileExists(defaultJsonPath))
        {
            try
            {
                const raw = await fsp.readFile(defaultJsonPath, "utf8");
                defaultTranslations = JSON.parse(raw);
                finalBaseContent = applyI18n(basePageContent, defaultTranslations);
            }
            catch (error)
            {
                console.error(
                    chalk.red(`Failed to apply default i18n for ${ relativePath } (${ defaultLocale }):`),
                    error
                );
                defaultTranslations = null;
                finalBaseContent = basePageContent;
            }
        }
    }

    await fsp.writeFile(distPagePath, finalBaseContent, "utf8");
    console.log(chalk.greenBright(`Page generated: ${ distPagePath }`));

    for (const locale of locales)
    {
        if (defaultLocale && locale === defaultLocale) continue;

        const localizedContent = await buildLocalizedPageContent({
            basePageContent,
            relativePath,
            locale,
            defaultLocale,
            canUseDefaultLocale,
            defaultTranslations,
            i18nIndex
        });

        const localizedDistPath = path.join(dirs.dist, locale, relativePath);
        await fse.ensureDir(path.dirname(localizedDistPath));
        await fsp.writeFile(localizedDistPath, localizedContent, "utf8");

        console.log(chalk.greenBright(`Page generated: ${ localizedDistPath }`));
    }
}

async function buildLocalizedPageContent(options)
{
    const {
        basePageContent,
        relativePath,
        locale,
        defaultLocale,
        canUseDefaultLocale,
        i18nIndex
    } = options;

    let { defaultTranslations } = options;
    let mergedTranslations = {};

    if (defaultTranslations && canUseDefaultLocale)
    {
        mergedTranslations = deepMerge({}, defaultTranslations);
    }
    else if (defaultLocale && !defaultTranslations && canUseDefaultLocale)
    {
        const fallbackDefaultJsonPath = i18nIndex.get(`${ defaultLocale }:${ relativePath }`);
        if (fallbackDefaultJsonPath && await fileExists(fallbackDefaultJsonPath))
        {
            try
            {
                const raw = await fsp.readFile(fallbackDefaultJsonPath, "utf8");
                defaultTranslations = JSON.parse(raw);
                mergedTranslations = deepMerge({}, defaultTranslations);
            }
            catch (error)
            {
                console.error(
                    chalk.red(`Failed to load default i18n (lazy) for ${ relativePath } (${ defaultLocale }):`),
                    error
                );
            }
        }
    }

    const jsonPath = i18nIndex.get(`${ locale }:${ relativePath }`);
    if (jsonPath && await fileExists(jsonPath))
    {
        try
        {
            const raw = await fsp.readFile(jsonPath, "utf8");
            const localeTranslations = JSON.parse(raw);
            mergedTranslations = deepMerge(mergedTranslations, localeTranslations);
        }
        catch (error)
        {
            console.error(
                chalk.red(`Failed to apply i18n for ${ relativePath } (${ locale }):`),
                error
            );
        }
    }

    return Object.keys(mergedTranslations).length > 0
        ? applyI18n(basePageContent, mergedTranslations)
        : basePageContent;
}
