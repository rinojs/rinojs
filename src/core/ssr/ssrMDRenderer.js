import fs from "fs/promises";
import path from "path";
import markdownit from 'markdown-it'

export async function renderSSRMD (content, attributes, mdDir)
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
            let result = await fs.readFile(path.join(mdDir, mdPath + ".md"), "utf-8");
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

function removeLWS (input)
{
    const lines = input.split('\n');
    let inCodeBlock = false;

    return lines
        .map(line =>
        {
            if (line.trim().startsWith('```'))
            {
                inCodeBlock = !inCodeBlock;
                return line.replace(/^\s*/, '');
            }
            if (inCodeBlock)
            {
                return line;
            }
            return line.replace(/^\s*/, '');
        })
        .join('\n');
}

function removeCodeLWS (input)
{
    const lines = input.split('\n');
    let inCodeBlock = false;
    let codeBlockLines = [];
    const result = [];

    for (const line of lines)
    {
        if (line.trim().startsWith('```'))
        {
            if (inCodeBlock)
            {
                const minIndent = Math.min(
                    ...codeBlockLines
                        .filter(l => l.trim() !== '')
                        .map(l => l.match(/^\s*/)[0].length)
                );

                result.push(
                    ...codeBlockLines.map(l => l.slice(minIndent))
                );

                codeBlockLines = [];
            }

            inCodeBlock = !inCodeBlock;
            result.push(line);
        }
        else if (inCodeBlock)
        {
            codeBlockLines.push(line);
        }
        else
        {
            result.push(line);
        }
    }

    return result.join('\n');
}