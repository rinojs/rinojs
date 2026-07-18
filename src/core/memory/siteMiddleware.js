import { injectReload } from "../inject-reload.js";
import { outputCandidates } from "./routes.js";

export function createMemorySiteHandler(engine, options = {})
{
    return async function memorySiteHandler(req, res)
    {
        const entry = outputCandidates(req.path).map(url => engine.store.get(url)).find(Boolean);
        if (!entry) return res.status(404).send("Page not found");

        let body = entry.body;
        if (options.reloadPort && entry.contentType?.startsWith("text/html"))
        {
            body = await injectReload(body.toString(), options.reloadPort);
        }

        res.setHeader("Content-Type", entry.contentType || "application/octet-stream");
        res.setHeader("Cache-Control", "no-cache");
        if (req.method === "HEAD") return res.end();
        return res.send(body);
    };
}
