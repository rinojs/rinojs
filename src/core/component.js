import path from 'path';
import { getResultFromCode } from './scriptRenderer.js';
import { renderMD } from './mdRenderer.js'
import typescript from 'typescript';

export function buildComponent(content, components, mds)
{
    const componentRegex = /<component\s+([^>]+?)\s*\/?>/g;
    const scriptRegex = /<script\s+([^>]+?)\s*(?:>\s*(.*?)\s*<\/script>|\/>)/gs;
    const attributeRegex = /(@?)([a-zA-Z]+)\s*=\s*(['"])(.*?)\3/g;

    let result = content;

    result = result.replace(scriptRegex, (_, attributesString, code) =>
    {
        const attributes = parseAttributes(attributesString, attributeRegex);
        const scriptType = attributes.find(attr => attr.name === '@type')?.content.toLowerCase();

        if (!scriptType) return _;

        if (scriptType == "markdown" || scriptType == "md")
        {
            const mdPath = attributes.find(attr => attr.name === '@path')?.content || '';
            const filteredCode = mdPath ? code : code.replace(/<\\\/script>/g, '</script>');
            return renderMD(filteredCode, attributes, mds);
        }

        if (scriptType == "javascript" || scriptType == "js")
        {
            return getResultFromCode(code);
        }

        if (scriptType == "typescript" || scriptType == "ts")
        {
            const compiledCode = typescript.transpile(code, {
                compilerOptions: {
                    module: typescript.ModuleKind.ESNext,
                    target: typescript.ScriptTarget.ESNext,
                },
            });

            return getResultFromCode(compiledCode);
        }

        return "";
    });

    result = result.replace(componentRegex, (_, attributesString) =>
    {
        const attributes = parseAttributes(attributesString, attributeRegex);

        return renderComponent(attributes, components);
    });

    return result;
};

function renderComponent(attributes, components)
{
    const componentPath = attributes.find(attr => attr.name === '@path')?.content;
    const componentTag = attributes.find(attr => attr.name === '@tag')?.content || '';

    const componentContent = components.find(c =>
        path.normalize(c.path).includes(path.normalize(componentPath + '.html'))
    )?.content;

    if (!componentContent)
    {
        console.warn(`Warning: Component "${ componentPath }" not found.`);
        return ``;
    }

    const renderedContent = buildComponent(componentContent, components);

    const otherAttributes = attributes
        .filter(attr => !['@path', '@tag'].includes(attr.name))
        .map(attr => `${ attr.name }="${ attr.content }"`)
        .join(' ');

    if (componentTag)
    {
        return `<${ componentTag } ${ otherAttributes }>${ renderedContent }</${ componentTag }>`;
    }
    else
    {
        return renderedContent;
    }
}

function parseAttributes(attributeString, regex)
{
    const attributes = [];
    let match;
    while ((match = regex.exec(attributeString)))
    {
        attributes.push({
            name: match[1] ? '@' + match[2] : match[2],
            content: match[4]
        });
    }
    return attributes;
}