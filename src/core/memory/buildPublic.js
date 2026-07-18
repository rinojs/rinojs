import fsp from "node:fs/promises";
import path from "node:path";
import { dirExists } from "../fsHelper.js";
import { contentTypeFor } from "./mime.js";

async function getPublicFiles(dir)
{
    const files = [];
    for (const entry of await fsp.readdir(dir, { withFileTypes: true }))
    {
        const source = path.join(dir, entry.name);
        if (entry.isDirectory()) files.push(...await getPublicFiles(source));
        else files.push(source);
    }
    return files;
}

export async function buildMemoryPublic(context, write)
{
    const { public: publicDir } = context.dirs;
    if (!await dirExists(publicDir)) return;

    const files = await getPublicFiles(publicDir);

    for (const source of files)
    {
        const relative = path.relative(publicDir, source).replace(/\\/g, "/");
        write(`/${ relative }`, await fsp.readFile(source), contentTypeFor(source));
    }
}
