const { getValueFromObj, getValueFromList } = require('./value-getter');
const { getDataFromTot } = require('./tot-handler');


async function buildTemplateData(content, data = null, props = null)
{
    let temp = content;
    let result = "";
    let target = "";

    while (temp.length > 0)
    {
        start = temp.indexOf("{{") + 2;
        end = temp.indexOf("}}", start);

        if (start == 1 || end == -1)
        {
            result = result + temp;
            break;
        }

        result = result + temp.substring(0, start - 2);
        target = temp.substring(start, end).trim();
        temp = temp.substring(end + 2);

        if (target.substring(0, 5) == "@tot.")
        {
            let targetArray = target.split(",");
            let tempResult = await getDataFromTot(targetArray[0].substring(5), targetArray[1].trim());
            tempResult = await buildTemplateData(tempResult, data, props);
            result = result + tempResult;
        }
        else if (target.substring(0, 6) == "@data." && data)
        {
            if (target.substring(5, 9) == ".md.") result = result + `{{ ${ target } }}`;
            else
            {
                let tempResult = (await getValueFromObj(target.substring(6), data)).trim();
                tempResult = await buildTemplateData(tempResult, data, props);
                result = result + tempResult;
            }
        }
        else if (target.substring(0, 6) == "@props" && props)
        {
            let tempResult = await getValueFromList(target.substring(6), props);
            tempResult = await buildTemplateData(tempResult, data, props);
            result = result + tempResult;
        }
        else
        {
            result = result + `{{ ${ target } }}`;
        }
    }

    return result;
}

async function findEnd(content, start)
{
    if (!content) return -1;
    let end = -1;
    let depth = 1;

    for (let i = start; i < content.length; i++)
    {
        if (content[i] === "{" && content[i + 1] === "{")
        {
            depth++;
            i++;
        }
        else if (content[i] === "}" && content[i + 1] === "}")
        {
            depth--;

            if (depth === 0)
            {
                end = i;
                break;
            }

            i++;
        }
    }

    return end;
}

async function listComponentSyntax(input)
{
    const result = [];
    let currentSubstring = "";
    let depth = 0;

    for (let i = 0; i < input.length; i++)
    {
        const char = input[i];

        if (char === ",")
        {
            if (depth === 0)
            {
                result.push(currentSubstring.trim());
                currentSubstring = "";
            }
            else
            {
                currentSubstring += char;
            }
        }
        else if (char === "(")
        {
            currentSubstring += char;
            depth++;
        }
        else if (char === ")")
        {
            currentSubstring += char;
            depth--;
        }
        else
        {
            currentSubstring += char;
        }
    }

    if (currentSubstring.trim() !== "")
    {
        result.push(currentSubstring.trim());
    }

    return result;
}

module.exports = { findEnd, listComponentSyntax, buildTemplateData }