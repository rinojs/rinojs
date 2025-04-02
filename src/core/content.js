import path from "path";
import fsp from "fs/promises";
import markdownit from 'markdown-it';
import { fileExists } from "./fsHelper.js";
import { buildComponent } from "./component.js";
import { removeLWS, removeCodeLWS } from "./mdFilter.js";

export async function buildContent (mdPath, pagePath, componentsDir, mdsDir, args = [])
{
    if (!await fileExists(mdPath))
    {
        console.error("Building content: Markdown file not found");
        return "Building content: Markdown file not found";
    }

    const fileContent = await fsp.readFile(mdPath, "utf-8");
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
            addPrevNextData(contentData, allFiles, currentFile, baseUrl);
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
            addPrevNextData(contentData, allFiles, currentFile, baseUrl);
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
        addPrevNextData(contentData, allFiles, currentFile, baseUrl);
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

function replaceContentTags (template, contentData)
{
    return template.replace(/{{\s*content\.(\w+)\s*}}/g, (match, key) =>
    {
        if (contentData.hasOwnProperty(key))
        {
            return contentData[key];
        }
        else
        {
            return match;
        }
    });
}

function addPrevNextData (contentData, allFiles, currentFile, baseUrl)
{
    const currentIndex = allFiles.indexOf(currentFile);
    const getName = (file) => file.replace(/^\d+-/, "").replace(/\.md$/, "");
    const getLink = (file) => baseUrl + file.replace(/\.md$/, "");

    if (currentIndex > 0)
    {
        const prevFile = allFiles[currentIndex - 1];
        contentData.prevLink = getLink(prevFile);
        contentData.prevName = getName(prevFile);
    } else
    {
        contentData.prevLink = "";
        contentData.prevName = "";
    }

    if (currentIndex < allFiles.length - 1)
    {
        const nextFile = allFiles[currentIndex + 1];
        contentData.nextLink = getLink(nextFile);
        contentData.nextName = getName(nextFile);
    } else
    {
        contentData.nextLink = "";
        contentData.nextName = "";
    }

    return contentData;
}