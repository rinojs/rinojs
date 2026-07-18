import fsp from "node:fs/promises";
import path from "node:path";
import fse from "fs-extra";
import { normalizeOutputUrl } from "./outputStore.js";

export class DiskOutputStore
{
    constructor(root)
    {
        this.root = path.resolve(root);
    }

    async replace(entries)
    {
        await fse.emptyDir(this.root);
        for (const [url, entry] of entries)
        {
            const relative = normalizeOutputUrl(url).slice(1);
            const target = path.resolve(this.root, relative);
            if (!target.startsWith(`${ this.root }${ path.sep }`)) throw new Error("Output path escapes build directory");
            await fsp.mkdir(path.dirname(target), { recursive: true });
            await fsp.writeFile(target, entry.body);
        }
    }
}
