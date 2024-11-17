import path from 'path';
import { getResultFromCode } from './scriptRenderer.js';
import { renderMD } from './mdRenderer.js'

export function buildComponent(content, components, mds)
{
    const componentRegex = /<component\s+([^>]+?)\s*\/?>/g;
    const mdRegex = /<md\s+([^>]*?)\s*>(.*?)<\/md>/gs;
    const attributeRegex = /(@?)([a-zA-Z]+)\s*=\s*(['"])(.*?)\3/g;
    const scriptRegex = /{{\s*(.*?)\s*}}/g;

    let result = content;

    result = result.replace(scriptRegex, (_, code) =>
    {
        return getResultFromCode(code);
    });

    result = result.replace(componentRegex, (_, attributesString) =>
    {
        const attributes = parseAttributes(attributesString, attributeRegex);

        return renderComponent(attributes, components);
    });

    result = result.replace(mdRegex, (_, attributesString, mdContent) =>
    {
        const attributes = parseAttributes(attributesString, attributeRegex);

        return renderMD(mdContent, attributes, mds);
    });

    return result;
};

function renderComponent(attributes, components)
{
    const componentName = attributes.find(attr => attr.name === '@name')?.content;
    const componentType = attributes.find(attr => attr.name === '@type')?.content || 'div';

    const componentContent = components.find(c =>
        path.normalize(c.path).includes(path.normalize(componentName + '.html'))
    )?.content;

    if (!componentContent)
    {
        console.warn(`Warning: Component "${ componentName }" not found.`);
        return `<${ componentType }></${ componentType }>`;
    }

    const renderedContent = buildComponent(componentContent, components);

    const otherAttributes = attributes
        .filter(attr => !['@name', '@type'].includes(attr.name))
        .map(attr => `${ attr.name }="${ attr.content }"`)
        .join(' ');

    return `<${ componentType } ${ otherAttributes }>${ renderedContent }</${ componentType }>`;
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