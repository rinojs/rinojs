async function getValueFromObj(target, data)
{
    try
    {
        return await target.split(".").reduce((obj, prop) => obj[prop], data);
    }
    catch (e)
    {
        console.error(e);
        return "";
    }
}

async function getValueFromList(target, list)
{
    try
    {
        if (list.length == 0) return "";

        let arrayIndex = await getIndex(target)

        if (arrayIndex === null) return "";

        let result = list[arrayIndex];

        if (!result) return "";

        return result;
    }
    catch (error)
    {
        console.error(error);
        return "";
    }
}

async function getIndex(str)
{
    let result = "";
    let isNumber = false;

    for (const char of str)
    {
        if (isNumber)
        {
            if (char >= '0' && char <= '9')
            {
                result += char;
            }
            else
            {
                break;
            }
        }
        else if (char === '[')
        {
            isNumber = true;
        }
    }

    if (result !== "")
    {
        return parseInt(result);
    }

    return null;
}

module.exports = { getValueFromObj, getValueFromList }