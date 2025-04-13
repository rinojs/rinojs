import path from "path";
import fsp from "fs/promises";
import markdownit from 'markdown-it';
import { fileExists } from "./fsHelper.js";
import { buildComponent } from "./component.js";
import { removeLWS, removeCodeLWS } from "./mdFilter.js";

export async function buildContent (mdPath, pagePath, componentsDir, mdsDir, args = [])
{
    try
    {
        if (!await fileExists(mdPath))
        {
            console.error("Building content: Markdown file not found");
            return "Building content: Markdown file not found";
        }

        const fileContent = await fsp.readFile(mdPath, "utf8");
        const contentDir = path.dirname(mdPath);
        const allFiles = (await fsp.readdir(contentDir))
            .filter(f => f.endsWith(".md"))
            .sort((a, b) =>
            {
                const aNum = parseInt(a.split("-")[0]);
                const bNum = parseInt(b.split("-")[0]);
                return aNum - bNum;
            });
        const currentFile = path.basename(mdPath);
        const category = path.basename(contentDir);
        const baseUrl = `/contents/${category}/`;
        const jsonCommentRegex = /^<!--\s*([\s\S]*?)\s*-->\s*/;
        const jsonMatch = fileContent.match(jsonCommentRegex);
        const mdit = markdownit({
            html: true,
            linkify: true,
            typographer: true
        });

        mdit.enable(['newline']);

        if (jsonMatch)
        {
            try
            {
                const contentData = JSON.parse(jsonMatch[1]);
                const mdContent = fileContent.slice(jsonMatch[0].length);
                const htmlContent = mdit.render(removeCodeLWS(removeLWS(mdContent)));
                contentData.body = htmlContent;
                contentData.urlPath = `/contents/${category}/${currentFile.replace(".md", "")}`;

                await addNearbyContentData(contentData, allFiles, currentFile, baseUrl, contentDir);

                const updatedArgs = [...args, JSON.stringify(contentData)];
                const pageTemplate = await buildComponent(
                    pagePath,
                    componentsDir,
                    mdsDir,
                    updatedArgs
                );

                return replaceContentTags(pageTemplate, contentData);
            }
            catch (error)
            {
                console.error("Building content: Failed to parse content data in JSON, ", error.message);

                const htmlContent = mdit.render(removeCodeLWS(removeLWS(fileContent)));
                const contentData = {};
                contentData.body = htmlContent;
                contentData.urlPath = `/contents/${category}/${currentFile.replace(".md", "")}`;

                await addNearbyContentData(contentData, allFiles, currentFile, baseUrl, contentDir);

                const updatedArgs = [...args, JSON.stringify(contentData)];
                const pageTemplate = await buildComponent(
                    pagePath,
                    componentsDir,
                    mdsDir,
                    updatedArgs
                );

                return replaceContentTags(pageTemplate, contentData);
            }
        }
        else
        {
            const htmlContent = mdit.render(removeCodeLWS(removeLWS(fileContent)));
            const contentData = {};
            contentData.body = htmlContent;
            contentData.urlPath = `/contents/${category}/${currentFile.replace(".md", "")}`;

            await addNearbyContentData(contentData, allFiles, currentFile, baseUrl, contentDir);

            const updatedArgs = [...args, JSON.stringify(contentData)];
            const pageTemplate = await buildComponent(
                pagePath,
                componentsDir,
                mdsDir,
                updatedArgs
            );

            return replaceContentTags(pageTemplate, contentData);
        }
    }
    catch (error)
    {
        console.error("Error in buildContent:", error.message);
        return `Error building content: ${error.message}`;
    }
}

function replaceContentTags (template, contentData)
{
    return template.replace(/{{\s*content\.([\w.\[\]"]+)\s*}}/g, (match, pathStr) =>
    {
        try
        {
            const safePath = pathStr.replace(/\[(\d+)]/g, '.$1');
            const pathParts = safePath.split('.');
            let value = contentData;

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

            return (typeof value === 'string' || typeof value === 'number') ? value : match;
        }
        catch (e)
        {
            return match;
        }
    });
}

async function addNearbyContentData (contentData, allFiles, currentFile, baseUrl, contentDir)
{
    const currentIndex = allFiles.indexOf(currentFile);
    const getLink = (file) => baseUrl + file.replace(/\.md$/, "");
    const getMetaFromFile = async (file) =>
    {
        const filePath = path.join(contentDir, file);
        const meta = {
            link: getLink(file)
        };

        try
        {
            const content = await fsp.readFile(filePath, "utf8");
            const jsonMatch = content.match(/^<!--\s*([\s\S]*?)\s*-->/);
            if (jsonMatch)
            {
                const jsonData = JSON.parse(jsonMatch[1]);
                Object.assign(meta, jsonData);
            }
        }
        catch (e)
        {
        }

        return meta;
    };

    const nearby = [];

    const start = Math.max(0, currentIndex - 4);
    const end = Math.min(allFiles.length, currentIndex + 5);

    for (let i = start; i < end; i++)
    {
        const file = allFiles[i];
        const meta = await getMetaFromFile(file);
        nearby.push(meta);
    }

    contentData.nearby = nearby;
    return contentData;
}