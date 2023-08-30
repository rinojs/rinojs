const fs = require('fs');
const path = require('path');

function emptyDirectory(directoryPath, targetDirectory = null, exceptionList = [])
{
    const files = fs.readdirSync(directoryPath);

    if (targetDirectory)
    {
        const targetFiles = fs.readdirSync(targetDirectory);

        for (const file of targetFiles)
        {
            const filePath = path.join(directoryPath, file);
            exceptionList.push(filePath);
        }
    }

    for (const file of files)
    {
        const filePath = path.join(directoryPath, file);
        const stat = fs.statSync(filePath);

        if (!exceptionList.includes(filePath))
        {
            if (stat.isDirectory())
            {
                emptyDirectory(filePath, null, exceptionList);
                fs.rmdirSync(filePath);
            }
            else
            {
                fs.unlinkSync(filePath);
            }
        }
    }
}

module.exports = {
    emptyDirectory
};