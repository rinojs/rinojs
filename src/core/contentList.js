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
    const contentList = selectedFiles.map(file => ({
        name: file.replace(/^\d+-/, "").replace(/\.md$/, ""),
        link: baseUrl + file.replace(/\.md$/, "")
    }));
    const totalPages = Math.ceil(files.length / pageSize);
    const pagination = {
        prevLink: pageIndex > 1 ? `/contents-list/${category}/${category}-${pageIndex - 1}` : "",
        nextLink: pageIndex < totalPages ? `/contents-list/${category}/${category}-${pageIndex + 1}` : ""
    };
    const contentListData = {
        contentList: contentList,
        pagination: pagination
    }
    const updatedArgs = [...args, JSON.stringify(contentListData)];
    const pageTemplate = await buildComponent(
        pagePath,
        componentsDir,
        mdsDir,
        updatedArgs
    );

    return replaceContentListTags(pageTemplate, contentList, pagination);
}

function replaceContentListTags (template, contentList, pagination = {})
{
    return template.replace(/{{\s*contentList\.(name|link)(\d+)\s*}}|{{\s*contentList\.(prevLink|nextLink)\s*}}/g,
        (match, type, indexStr, key) =>
        {
            if (type && indexStr)
            {
                const index = parseInt(indexStr, 10) - 1;
                const item = contentList[index];
                if (!item) return "";
                return type === "name" ? item.name : item.link;
            }
            else if (key)
            {
                return pagination[key] || "";
            }
            return match;
        });
}