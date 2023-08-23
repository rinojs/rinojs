const path = require('path');
const Tot = require('totjs');


async function getDataFromTot(tagname, filename)
{
    const tot = new Tot(path.resolve(filename));
    return await tot.getDataByName(tagname);
}

async function buildSingleFromTot(text)
{
    if (!text || text.indexOf("@tot.") == -1) return text;

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

        if (target.substring(0, 5) == "@tot.")
        {
            let targetArray = target.split(",");
            result = result + await getDataFromTot(targetArray[0].substring(5), targetArray[1].trim());
        }
        else
        {
            result = result + `{{ ${ target } }}`;
        }
    }

    return result;
}


module.exports = { getDataFromTot, buildSingleFromTot }