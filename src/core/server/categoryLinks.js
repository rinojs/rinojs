import fsp from "fs/promises";
import path from "path";
import { dirExists } from "../fsHelper.js";

export async function buildCategoryLinks(contentsDir)
{
    const categoryLinks = {};

    if (!await dirExists(contentsDir))
    {
        return categoryLinks;
    }

    const themeDirs = (await fsp.readdir(contentsDir, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const theme of themeDirs)
    {
        const themeDir = path.join(contentsDir, theme);
        const categoryDirs = (await fsp.readdir(themeDir, { withFileTypes: true }))
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const category of categoryDirs)
        {
            const categoryDir = path.join(themeDir, category);
            const files = (await fsp.readdir(categoryDir)).filter(file => file.endsWith(".md"));

            if (files.length > 0)
            {
                categoryLinks[`${ theme }/${ category }`] = `/contents-list/${ theme }/${ category }/${ category }-1`;
            }
        }
    }

    return categoryLinks;
}
