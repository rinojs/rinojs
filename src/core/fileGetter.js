import fs from 'fs';
import path from 'path';

export function getFilesRecursively(dir, extensions)
{
    const results = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files)
    {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory())
        {
            results.push(...this.getFilesRecursively(filePath, extensions));
        }
        else if (extensions.includes(path.extname(file.name)))
        {
            results.push(filePath);
        }
    }

    return results;
}