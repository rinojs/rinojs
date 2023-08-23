const fs = require('fs');
const Tot = require('totjs');

async function loadJSON(filename, encoding = "utf8")
{
    try
    {
        fs.readFile(filename, encoding, function (error, data) 
        {
            if (error) throw error;
            else return JSON.parse(data);
        });
    }
    catch (err)
    {
        console.error(err);
    }
}

async function loadTot(filename, encoding = "utf8")
{
    const tot = new Tot(filename, encoding);
    return await tot.getAll();
}

module.exports = { loadJSON, loadTot }