const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

async function copyAssets(origin, destination, sub = "")
{
    try
    {
        if (!fs.existsSync(origin))
        {
            throw new Error(`
                The origin directory does not exist...
                origin directory: ${ origin }
            `);
        }

        if (!fs.existsSync(destination))
        {
            fs.mkdirSync(destination);
        }

        const files = fs.readdirSync(origin);
        let size = files.length;
        let temp = "- " + sub;

        for (let i = 0; i < size; i++)
        {
            console.log(`${ temp } Copying ${ i + 1 }/${ size }`);

            const file = files[i];
            const sourcePath = path.join(origin, file);
            const destPath = path.join(destination, file);

            const sourceStats = fs.statSync(sourcePath);

            if (sourceStats.isFile())
            {
                if (!fs.existsSync(destPath))
                {
                    await fse.copy(sourcePath, destPath);
                    console.log(`Copied new file: ${ sourcePath } to ${ destPath }`);
                }
                else
                {
                    const destStats = fs.statSync(destPath);
                    if (sourceStats.mtime > destStats.mtime || sourceStats.birthtime > destStats.birthtime)
                    {
                        await fse.copy(sourcePath, destPath);
                    }
                }
            }
            else if (sourceStats.isDirectory())
            {
                await copyAssets(sourcePath, destPath, temp);
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

module.exports = { copyAssets }