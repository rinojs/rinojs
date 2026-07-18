import fsp from "node:fs/promises";
import path from "node:path";
import { buildComponent } from "../component.js";
import { deepMerge } from "../deepMerge.js";
import { fileExists, getFilesRecursively } from "../fsHelper.js";
import { applyI18n } from "../i18n.js";

async function translations(index, key)
{
    const file = index.get(key);
    if (!file || !await fileExists(file)) return {};
    return JSON.parse(await fsp.readFile(file, "utf8"));
}

export function pageOutputUrls(context, pagePath)
{
    const relative = path.relative(context.dirs.pages, pagePath).replace(/\\/g, "/");
    const urls = [`/${ relative }`];
    const defaultLocale = context.config?.i18n?.defaultLocale;
    for (const locale of context.locales)
    {
        if (locale !== defaultLocale) urls.push(`/${ locale }/${ relative }`);
    }
    return urls;
}

export async function buildMemoryPages(context, write, options = {})
{
    const { dirs, config, locales, i18nIndex, categoryLinks } = context;
    const files = options.pagePaths || await getFilesRecursively(dirs.pages, [".html"]);
    const defaultLocale = config?.i18n?.defaultLocale;

    for (const pagePath of files)
    {
        const relative = path.relative(dirs.pages, pagePath).replace(/\\/g, "/");
        const args = [JSON.stringify({ pagePath, categoryLinks })];
        const base = await buildComponent(pagePath, dirs.components, dirs.mds, args);
        const defaults = defaultLocale ? await translations(i18nIndex, `${ defaultLocale }:${ relative }`) : {};
        write(`/${ relative }`, applyI18n(base, defaults), "text/html; charset=utf-8");

        for (const locale of locales)
        {
            if (locale === defaultLocale) continue;
            const localized = await translations(i18nIndex, `${ locale }:${ relative }`);
            write(`/${ locale }/${ relative }`, applyI18n(base, deepMerge(defaults, localized)), "text/html; charset=utf-8");
        }
    }
}
