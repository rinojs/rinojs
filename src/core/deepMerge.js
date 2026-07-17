function isPlainObject(value)
{
    return Object.prototype.toString.call(value) === "[object Object]";
}

export function deepMerge(base = {}, override = {})
{
    const result = { ...base };

    for (const [key, value] of Object.entries(override || {}))
    {
        if (isPlainObject(result[key]) && isPlainObject(value))
        {
            result[key] = deepMerge(result[key], value);
        }
        else
        {
            result[key] = value;
        }
    }

    return result;
}
