import fsp from "node:fs/promises";
import path from "node:path";
import { fileExists } from "../fsHelper.js";
import { injectReload } from "../inject-reload.js";

function publicHtmlPath(publicDir, requestPath)
{
    const decoded = decodeURIComponent(requestPath);
    const relative = decoded.endsWith("/") ? `${ decoded }index.html` : decoded;
    if (path.extname(relative).toLowerCase() !== ".html") return null;

    const root = path.resolve(publicDir);
    const target = path.resolve(root, `.${ relative }`);
    return target.startsWith(`${ root }${ path.sep }`) ? target : null;
}

export function createPublicHtmlHandler(publicDir, reloadPort)
{
    return async function publicHtmlHandler(req, res, next)
    {
        if (!reloadPort || (req.method !== "GET" && req.method !== "HEAD")) return next();

        const filePath = publicHtmlPath(publicDir, req.path);
        if (!filePath || !await fileExists(filePath)) return next();

        const html = await fsp.readFile(filePath, "utf8");
        const body = await injectReload(html, reloadPort);
        res.type("html").setHeader("Cache-Control", "no-cache");
        if (req.method === "HEAD") return res.end();
        return res.send(body);
    };
}
