import fsp from "fs/promises";

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