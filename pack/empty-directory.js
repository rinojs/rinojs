import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function emptyDirectory (directoryPath)
{
    if (!isDirectorySync(directoryPath))
    {
        console.log(chalk.yellow(`${directoryPath} does not exist!`));
        fs.mkdirSync(directoryPath);
        console.log(chalk.green(`Created ${directoryPath}!`));
        return;
    }

    const files = fs.readdirSync(directoryPath);

    for (const file of files)
    {
        const filePath = path.join(directoryPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory())
        {
            emptyDirectory(filePath);
            fs.rmdirSync(filePath);
        }
        else
        {
            fs.unlinkSync(filePath);
        }
    }
}

function isDirectorySync (path)
{
    try
    {
        return fs.statSync(path).isDirectory();
    }
    catch
    {
        return false;
    }
}