import path from 'path';
import markdownit from 'markdown-it'

export function renderMD(content, attributes, mds)
{
    const mdName = attributes.find(attr => attr.name === '@name')?.content || '';
    const mdType = attributes.find(attr => attr.name === '@type')?.content || 'div';
    const otherAttributes = attributes
        .filter(attr => !['@name', '@type'].includes(attr.name))
        .map(attr => `${ attr.name }="${ attr.content }"`)
        .join(' ');

    const mdit = markdownit({
        html: true,
        linkify: true,
        typographer: true
    });

    if (mdName)
    {
        let result = mds.find(c =>
            path.normalize(c.path).includes(path.normalize(mdName + '.html'))
        )?.content;

        if (!result)
        {
            console.warn(`Warning: Component "${ mdName }" not found.`);
            return `<${ mdType }></${ mdType }>`;
        }

        result = mdit.render(result);

        return `<${ mdType } ${ otherAttributes }>${ result }</${ mdType }>`;
    }
    else
    {
        if (content)
        {
            let result = mdit.render(content);

            return `<${ mdType } ${ otherAttributes }>${ result }</${ mdType }>`;
        }
        else
        {
            return `<${ mdType } ${ otherAttributes }></${ mdType }>`;
        }
    }
}