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

module.exports = { getValueFromObj }