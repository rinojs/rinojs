export function getDeepValue(obj, path)
{
    if (!obj || typeof path !== "string") return "";

    try
    {
        const normalized = path
            .replace(/\[(\d+)\]/g, ".$1")
            .replace(/^\./, "");

        const parts = normalized.split(".");

        let current = obj;
        for (const part of parts)
        {
            if (current == null) return "";
            current = current[part];
        }

        return current ?? "";
    }
    catch (error)
    {
        console.error("getDeepValue error:", error);
        return "";
    }
}

export function getValueFromObj(target, data)
{
    try
    {
        return target.split(".").reduce((obj, prop) => obj[prop], data);
    }
    catch (e)
    {
        console.error(e); return "";

    }
}

export function getValueFromList(target, list)
{
    try
    {
        if (list.length == 0) return "";

        let arrayIndex = getIndex(target);

        if (arrayIndex === null) return "";

        let result = list[arrayIndex];

        if (!result) return ""; return result;
    }
    catch (error)
    {
        console.error(error); return "";
    }
}

function getIndex(str)
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