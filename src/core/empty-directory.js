const fs = require('fs');
const path = require('path');

function emptyDirectory(directoryPath, targetDirectory = null, exceptionList = [])
{
    try
    {
        if (!fs.existsSync(directoryPath))
        {
            fs.mkdirSync(directoryPath);
            return false;
        }

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

        return true;
    }
    catch (error)
    {
        console.error(error);
        return false;
    }
}

module.exports = {
    emptyDirectory
};