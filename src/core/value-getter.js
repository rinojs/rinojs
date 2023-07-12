async function getValueFromObj(target, data)
{
    return await target.split(".").reduce((obj, prop) => obj[prop], data);
}

module.exports = { getValueFromObj }