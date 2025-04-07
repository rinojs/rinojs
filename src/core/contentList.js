import path from "path";
import fsp from "fs/promises";
import { buildComponent } from "./component.js";

export async function buildContentList (contentListPath, contentsDir, pagePath, componentsDir, mdsDir, pageSize = 10, args = [])
{
    const match = contentListPath.match(/^(.+)-(\d+)$/);

    if (!match)
    {
        console.error("Building content list page: Invalid content list path format.");
        return "Building content list page: Invalid content list path format.";
    }

    const category = match[1];
    const pageIndex = parseInt(match[2], 10);
    const contentDir = path.join(contentsDir, category);

    const files = (await fsp.readdir(contentDir))
        .filter(f => f.endsWith(".md"))
        .sort((a, b) =>
        {
            const aNum = parseInt(a.split("-")[0]);
            const bNum = parseInt(b.split("-")[0]);
            return bNum - aNum;
        });

    const startIndex = (pageIndex - 1) * pageSize;
    const selectedFiles = files.slice(startIndex, startIndex + pageSize);
    const baseUrl = `/contents/${category}/`;

    const contentList = [];

    for (const file of selectedFiles)
    {
        const filePath = path.join(contentDir, file);
        const content = await fsp.readFile(filePath, "utf-8");
        const jsonCommentRegex = /^<!--\s*([\s\S]*?)\s*-->\s*/;
        const jsonMatch = content.match(jsonCommentRegex);

        let contentData = {};
        if (jsonMatch)
        {
            try
            {
                contentData = JSON.parse(jsonMatch[1]);
            } catch (e)
            {
                console.warn(`Warning: Failed to parse JSON in ${file}:`, e.message);
            }
        }

        contentData.filename = file.toString();
        contentData.link = baseUrl + file.replace(/\.md$/, "");
        contentList.push(contentData);
    }

    const totalPages = Math.ceil(files.length / pageSize);
    const pagination = {
        prevLink: pageIndex > 1 ? `/contents-list/${category}/${category}-${pageIndex - 1}` : "",
        nextLink: pageIndex < totalPages ? `/contents-list/${category}/${category}-${pageIndex + 1}` : ""
    };

    const contentListData = {
        contentList: contentList,
        pagination: pagination
    };

    const updatedArgs = [...args, JSON.stringify(contentListData)];
    const pageTemplate = await buildComponent(pagePath, componentsDir, mdsDir, updatedArgs);

    return replaceContentListTags(pageTemplate, contentList, pagination);
}

function replaceContentListTags (template, contentListData)
{
    return template.replace(/{{\s*contentList\.([\w.\[\]"]+)\s*}}/g, (match, pathStr) =>
    {
        try
        {
            const safePath = pathStr.replace(/\[(\d+)]/g, '.$1');
            const pathParts = safePath.split('.');
            let value = contentListData;

            for (const part of pathParts)
            {
                if (value && Object.prototype.hasOwnProperty.call(value, part))
                {
                    value = value[part];
                }
                else
                {
                    return match;
                }
            }

            return typeof value === 'string' || typeof value === 'number' ? value : match;
        }
        catch (e)
        {
            return match;
        }
    });
}