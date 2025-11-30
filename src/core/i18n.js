import fsp from "fs/promises";
import path from 'path';
import { dirExists, getFilesRecursively } from "./fsHelper.js";
import { getDeepValue } from "./valueGetter.js";


export function applyI18n(html, translations = {})
{
    if (!translations || typeof translations !== "object")
        return html;

    return html.replace(/<lang>([\s\S]*?)<\/lang>/g, (match, key) =>
    {
        const path = key.trim();
        const value = getDeepValue(translations, path);

        if (value === "" || value === undefined || value === null)
            return match;

        return value;
    });
}

export async function loadI18nIndex(projectPath, configLocales)
{
    const i18nDir = path.join(projectPath, "i18n");
    const index = new Map();
    const locales = [];

    if (!await dirExists(i18nDir))
    {
        return { locales, index };
    }




    const localeEntries = await fsp.readdir(i18nDir, { withFileTypes: true });

    const allowedLocales = configLocales && Array.isArray(configLocales) && configLocales.length > 0 ? new Set(configLocales) : null;

    for (const dirent of localeEntries)
    {
        if (!dirent.isDirectory()) continue;

        const locale = dirent.name;

        if (allowedLocales && !allowedLocales.has(locale))
        {
            continue;
        }

        locales.push(locale);

        const localeDir = path.join(i18nDir, locale);
        const files = await getFilesRecursively(localeDir, [".json"]);

        for (const filePath of files)
        {
            const relJson = path.relative(localeDir, filePath).replace(/\\/g, "/");
            const relHtml = relJson.replace(/\.json$/i, ".html");
            index.set(`${ locale }:${ relHtml }`, filePath);
        }
    }

    return { locales, index };
}
