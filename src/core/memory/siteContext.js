import path from "node:path";
import { loadConfig } from "../configLoader.js";
import { loadI18nIndex } from "../i18n.js";
import { buildCategoryLinks } from "../server/categoryLinks.js";
import { getStaticBuildDirs } from "../staticBuild/dirs.js";

export async function createSiteContext(projectPath)
{
    const config = await loadConfig(projectPath);
    const dirs = getStaticBuildDirs(projectPath, config);
    const { locales, index: i18nIndex } = await loadI18nIndex(projectPath, config?.i18n?.locales);

    return {
        projectPath,
        config,
        dirs: { ...dirs, i18n: path.join(projectPath, "i18n") },
        locales,
        i18nIndex,
        categoryLinks: await buildCategoryLinks(dirs.contents)
    };
}
