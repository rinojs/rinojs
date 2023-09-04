async function removeComments(text)
{
    if (!text) return text;

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

        if (target.substring(0, 2) == "//")
        {
            continue;
        }
        else
        {
            result = result + `{{ ${ target } }}`;
        }
    }

    return result;
}

module.exports = { removeComments }