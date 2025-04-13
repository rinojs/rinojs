import fsp from "fs/promises";
import path from "path";
import markdownit from 'markdown-it';
import { fileExists } from "../fsHelper.js";
import { removeLWS, removeCodeLWS } from "../mdFilter.js";

export async function renderSSRMD (content, attributes, mdsDir)
{
    const mdPath = attributes.find(attr => attr.name === '@path')?.content || '';
    const mdTag = attributes.find(attr => attr.name === '@tag')?.content || 'div';
    const otherAttributes = attributes
        .filter(attr => !['@type', '@path', '@tag'].includes(attr.name))
        .map(attr => `${attr.name}="${attr.content}"`)
        .join(' ');

    const mdit = markdownit({
        html: true,
        linkify: true,
        typographer: true
    });

    mdit.enable(['newline']);

    if (mdPath)
    {
        try
        {
            const mdFilePatn = path.join(mdsDir, mdPath + ".md");

            if (!await fileExists(mdFilePatn))
            {
                return "Building markdown: Markdown file not found";
            }

            let result = await fsp.readFile(mdFilePatn, "utf8");
            result = mdit.render(removeCodeLWS(removeLWS(result)));
            return `<${mdTag} ${otherAttributes}>${result}</${mdTag}>`;
        }
        catch (error)
        {
            return `<${mdTag}>${error}</${mdTag}>`;
        }
    }
    else
    {
        if (content)
        {
            let result = mdit.render(removeCodeLWS(removeLWS(content)));

            return `<${mdTag} ${otherAttributes}>${result}</${mdTag}>`;
        }
        else
        {
            return `<${mdTag} ${otherAttributes}></${mdTag}>`;
        }
    }
}