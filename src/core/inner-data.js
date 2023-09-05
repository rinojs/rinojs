const { getValueFromObj, getValueFromList } = require('./value-getter');
const { getDataFromTot } = require('./tot-handler');

async function buildInnerData(content, data = null, props = null)
{
    let temp = content;
    let result = "";
    let target = "";
    let start = 0;
    let end = 0;

    while (temp.length > 0)
    {
        start = temp.indexOf("<") + 1;
        end = temp.indexOf(">", start);

        if (start == 0 || end == -1)
        {
            result = result + temp;
            break;
        }

        result = result + temp.substring(0, start - 1) + "";
        target = temp.substring(start, end).trim();
        temp = temp.substring(end + 1);

        if (target.substring(0, 5) == "@tot.")
        {
            let targetArray = target.split(",");
            result = result + (await getDataFromTot(targetArray[0].substring(5), targetArray[1].trim())).trim();
        }
        else if (target.substring(0, 6) == "@data." && data)
        {
            if (target.substring(5, 9) == ".md.") result = result + `{{ ${ target } }}`;
            else result = result + (await getValueFromObj(target.substring(6), data)).trim();
        }
        else if (target.substring(0, 6) == "@props" && props)
        {
            result = result + (await getValueFromList(target.substring(6), props)).trim();
        }
        else
        {
            result = result + `<${ target } }}>`;
        }
    }

    return result;
}

module.exports = { buildInnerData }