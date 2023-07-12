const { getValueFromObj } = require('./value-getter');

async function buildData(obj, data)
{
    obj.html = await buildSingleData(obj.html, data);
    obj.js = await buildSingleData(obj.js, data);
    obj.css = await buildSingleData(obj.css, data);
    return obj;
}

async function buildSingleData(text, data)
{
    if (!text || !data) return text;

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

        if (target.substring(0, 6) == "@data.")
        {
            result = result + await getValueFromObj(target.substring(6), data)
        }
        else
        {
            result = result + `{{ ${ target } }}`;
        }
    }

    return result;
}

module.exports = { buildData, buildSingleData }