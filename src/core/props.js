const { getValueFromList } = require('./value-getter');

async function buildProps(obj, data)
{
    obj.html = await buildSingleProps(obj.html, data);
    obj.js = await buildSingleProps(obj.js, data);
    obj.css = await buildSingleProps(obj.css, data);
    return obj;
}

async function buildSingleProps(text, data)
{
    if (!text || !data || text.indexOf("@props") == -1) return text;

    let tmp = text;
    let result = "";

    while (tmp.length > 0)
    {
        let start = tmp.indexOf("{{") + 2;
        let end = tmp.indexOf("}}");

        if (start == 1 || end == -1)
        {
            result = result + tmp;
            break;
        }

        result = result + tmp.substring(0, start - 2);
        let target = tmp.substring(start, end).trim();
        tmp = tmp.substring(end + 2);

        if (target.substring(0, 6) == "@props")
        {
            result = result + await getValueFromList(target.substring(6), data);
        }
        else
        {
            result = result + `{{ ${ target } }}`;
        }
    }

    return result;
}

module.exports = { buildProps, buildSingleProps }