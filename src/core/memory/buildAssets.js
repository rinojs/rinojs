import fsp from "node:fs/promises";
import path from "node:path";
import CleanCSS from "clean-css";
import { bundleCSS } from "../bundleCSS.js";
import { bundleJS } from "../bundleJS.js";
import { bundleTS } from "../bundleTS.js";
import { getFilesRecursively } from "../fsHelper.js";

export async function buildMemoryAssets(context, write)
{
    const { dirs, projectPath } = context;
    const scripts = await getFilesRecursively(dirs.scripts, [".js", ".mjs", ".ts"]);
    for (const source of scripts)
    {
        const extension = path.extname(source);
        const relative = path.relative(dirs.scripts, source).replace(/\\/g, "/").replace(/\.ts$/, ".js");
        const name = path.basename(source, extension);
        const body = extension === ".ts" ? await bundleTS(source, projectPath, name) : await bundleJS(source, name);
        write(`/scripts/${ relative }`, body, "application/javascript; charset=utf-8");
    }

    const cleaner = new CleanCSS();
    const styles = await getFilesRecursively(dirs.styles, [".css"]);
    for (const source of styles)
    {
        const relative = path.relative(dirs.styles, source).replace(/\\/g, "/");
        const raw = await fsp.readFile(source, "utf8");
        const bundled = await bundleCSS(raw, path.dirname(source), { rootDir: path.dirname(dirs.styles) });
        write(`/styles/${ relative }`, cleaner.minify(bundled).styles, "text/css; charset=utf-8");
    }
}
