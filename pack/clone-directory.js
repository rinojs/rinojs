import fs from 'fs';
import path from 'path';

export function cloneDirectory(sourcePath, targetPath)
{
    if (!fs.existsSync(targetPath))
    {
        fs.mkdirSync(targetPath, { recursive: true });
    }

    const files = fs.readdirSync(sourcePath);

    for (const file of files)
    {
        const sourceFilePath = path.join(sourcePath, file);
        const targetFilePath = path.join(targetPath, file);
        const stat = fs.statSync(sourceFilePath);

        if (stat.isDirectory())
        {
            cloneDirectory(sourceFilePath, targetFilePath);
        } else
        {
            fs.copyFileSync(sourceFilePath, targetFilePath);
        }
    }
}