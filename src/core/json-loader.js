const fs = require('fs');

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

module.exports = { loadJSON }