import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function copyFiles(origin, destination, imageQuality = 75, sub = "")
{
    try
    {
        if (!fs.existsSync(origin))
        {
            throw new Error(`
                The origin directory does not exist...
                origin directory: ${ chalk.redBright(origin) }
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
            console.log(chalk.cyanBright(`${ temp } Copying ${ i + 1 }/${ size }`));

            const file = files[i];
            const sourcePath = path.join(origin, file);
            const destPath = path.join(destination, file);

            const sourceStats = fs.statSync(sourcePath);

            if (sourceStats.isFile())
            {
                if (!fs.existsSync(destPath))
                {
                    await fse.copy(sourcePath, destPath);
                    console.log(chalk.greenBright(`Copied: ${ sourcePath } to ${ destPath }`));
                }
                else
                {
                    const destStats = fs.statSync(destPath);
                    if (sourceStats.mtime > destStats.mtime || sourceStats.birthtime > destStats.birthtime)
                    {
                        await fse.copy(sourcePath, destPath);
                        console.log(chalk.greenBright(`Copied: ${ sourcePath } to ${ destPath }`));
                    }
                }
            }
            else if (sourceStats.isDirectory())
            {
                await copyFiles(sourcePath, destPath, imageQuality, temp);
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