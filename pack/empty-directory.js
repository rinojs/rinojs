import fs from 'fs';
import path from 'path';

export function emptyDirectory(directoryPath)
{
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