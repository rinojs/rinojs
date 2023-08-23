async function encodeCode(page)
{
    let temp = page;
    let result = "";

    while (temp.length > 0)
    {
        let start = temp.indexOf(">", temp.indexOf("<code") + 5) + 1;
        let end = temp.indexOf("</code>", start)

        if (start == 0 || end == -1)
        {
            result = result + temp;
            break;
        }

        result = result + temp.substring(0, start);
        let code = temp.substring(start, end);
        code = code.replaceAll("{{", "&lcub;&lcub;");
        code = code.replaceAll("}}", "&rcub;&rcub;");
        code = code.replaceAll("<", "&lt;");
        code = code.replaceAll(">", "&gt;");
        result = result + code + "</code>";
        temp = temp.substring(end + 7);
    }

    return result;
}

async function decodeCode(page)
{
    let temp = page;
    let result = "";

    while (temp.length > 0)
    {
        let start = temp.indexOf(">", temp.indexOf("<code") + 5) + 1;
        let end = temp.indexOf("</code>", start)

        if (start == 0 || end == -1)
        {
            result = result + temp;
            break;
        }

        result = result + temp.substring(0, start);
        let code = temp.substring(start, end);
        code = code.replaceAll("&lcub;&lcub;", "{{");
        code = code.replaceAll("&rcub;&rcub;", "{{");
        code = code.replaceAll("&lt;", "<");
        code = code.replaceAll("&gt;", ">");
        result = result + code + "</code>";
        temp = temp.substring(end + 7);
    }

    return result;
}

module.exports = { encodeCode, decodeCode };