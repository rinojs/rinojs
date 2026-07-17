import fsp from "fs/promises";
import path from "path";
import { bundleCSS } from "../bundleCSS.js";
import { bundleJS } from "../bundleJS.js";
import { bundleTS } from "../bundleTS.js";
import { fileExists } from "../fsHelper.js";

export function registerAssetRoutes(app, projectPath)
{
    app.get(/^\/scripts\/.*\.js$/, async (req, res) =>
    {
        const requestPath = decodeURIComponent(req.path).replace("/scripts", "");
        const jsPath = path.join(projectPath, "scripts/export", requestPath);
        const tsPath = path.join(
            projectPath,
            "scripts/export",
            path.basename(requestPath, path.extname(requestPath)) + ".ts"
        );

        try
        {
            if (await fileExists(jsPath))
            {
                const script = await bundleJS(jsPath, path.basename(jsPath, path.extname(jsPath)));
                res.setHeader("Content-Type", "application/javascript");
                res.send(script);
                return;
            }

            if (await fileExists(tsPath))
            {
                const script = await bundleTS(tsPath, projectPath, path.basename(tsPath, path.extname(tsPath)));
                res.setHeader("Content-Type", "application/javascript");
                res.send(script);
                return;
            }
        }
        catch (err)
        {
            console.error("Script bundling error:", err);
            res.status(500).send("Script bundling error");
            return;
        }

        res.status(404).send("File not found");
    });

    app.get(/^\/styles\/.*\.css$/, async (req, res) =>
    {
        const requestPath = decodeURIComponent(req.path).replace("/styles", "");
        const stylePath = path.join(projectPath, "styles/export", requestPath);

        try
        {
            if (await fileExists(stylePath))
            {
                const raw = await fsp.readFile(stylePath, "utf8");
                const compiled = await bundleCSS(raw, path.dirname(stylePath), {
                    rootDir: path.join(projectPath, "styles")
                });
                res.setHeader("Content-Type", "text/css");
                res.send(compiled);
                return;
            }
        }
        catch (err)
        {
            res.status(500).send("Style bundling error");
            return;
        }

        res.status(404).send("File not found");
    });
}
