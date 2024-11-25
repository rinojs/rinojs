import path from 'path';
import markdownit from 'markdown-it'

export function renderMD(content, attributes, mds)
{
    const mdPath = attributes.find(attr => attr.name === '@path')?.content || '';
    const mdTag = attributes.find(attr => attr.name === '@tag')?.content || 'div';
    const otherAttributes = attributes
        .filter(attr => !['@type', '@path', '@tag'].includes(attr.name))
        .map(attr => `${ attr.name }="${ attr.content }"`)
        .join(' ');

    const mdit = markdownit({
        html: true,
        linkify: true,
        typographer: true
    });

    if (mdPath)
    {
        let result = mds.find(c =>
            path.normalize(c.path).includes(path.normalize(mdPath + '.md'))
        )?.content;

        if (!result)
        {
            console.warn(`Warning: Markdown "${ mdPath }" not found.`);
            return `<${ mdTag }></${ mdTag }>`;
        }

        result = mdit.render(result);

        return `<${ mdTag } ${ otherAttributes }>${ result }</${ mdTag }>`;
    }
    else
    {
        if (content)
        {
            let result = mdit.render(content);

            return `<${ mdTag } ${ otherAttributes }>${ result }</${ mdTag }>`;
        }
        else
        {
            return `<${ mdTag } ${ otherAttributes }></${ mdTag }>`;
        }
    }
}