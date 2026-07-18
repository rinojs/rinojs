import fsp from "fs/promises";
import path from 'path';

export async function fileExists (filePath)
{
    try
    {
        await fsp.access(filePath);
        return true;
    }
    catch (error)
    {
        return false;
    }
}

export async function dirExists (dirPath)
{
    try
    {
        const stat = await fsp.stat(dirPath);
        return stat.isDirectory();
    }
    catch (error)
    {
        return false;
    }
}


export async function getFilesRecursively (dir, extensions)
{
    const results = [];
    let files;
    try
    {
        files = await fsp.readdir(dir, { withFileTypes: true });
    }
    catch (error)
    {
        if (error.code === "ENOENT") return results;
        throw error;
    }
    for (const file of files)
    {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory())
        {
            results.push(...await getFilesRecursively(filePath, extensions));
        }
        else if (extensions.includes(path.extname(file.name)))
        {
            results.push(filePath);
        }
    }

    return results;
}
