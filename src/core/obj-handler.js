const fs = require('fs').promises;
const Tot = require('totjs');
const MarkdownIt = require('markdown-it')
const md = new MarkdownIt();

async function loadJSON(filename, encoding = "utf8")
{
    if (!filename) return "";

    try
    {
        let data = await fs.readFile(filename, encoding, function (error, data) 
        {
            if (error) throw error;
            else return data;
        });

        return JSON.parse(data);
    }
    catch (error)
    {
        console.error(error);
        return "";
    }
}

async function loadMD(filename, encoding = "utf8")
{
    if (!filename) return "";

    try
    {
        let data = await fs.readFile(filename, encoding, function (error, data) 
        {
            if (error) throw error;
            else return data;
        });

        return md.render(data);
    }
    catch (error)
    {
        console.error(error);
        return "";
    }
}


async function loadTot(filename, encoding = "utf8")
{
    const tot = new Tot(filename, encoding);
    return await tot.getAll();
}

module.exports = { loadJSON, loadTot, loadMD }