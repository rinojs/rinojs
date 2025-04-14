import fsp from "fs/promises";
import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { findPort } from "../find-port.js";
import { openBrowser } from "../browser.js";
import { dirExists, getFilesRecursively } from "../fsHelper.js"

export async function startBackofficeServer (projectPath)
{
    const currentDirname = path.dirname(fileURLToPath(import.meta.url));
    const app = express();
    const port = await findPort(3100);

    app.use(express.json());
    app.use(express.static(path.join(currentDirname, "client")));
    app.use(express.static(path.join(projectPath, "public")));

    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    app.post("/api/upload-image", upload.single("image"), async (req, res) =>
    {
        let { outputDir, quality = "100" } = req.body;

        if (!req.file || !outputDir)
        {
            return res.status(400).json({ error: "Missing image or outputDir" });
        }

        const isRelative = !path.isAbsolute(outputDir);
        if (isRelative)
        {
            outputDir = path.resolve(projectPath, outputDir);
        }

        try
        {
            await fsp.mkdir(outputDir, { recursive: true });

            const parsedName = path.parse(req.file.originalname);
            const baseName = parsedName.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-_]/g, "");
            const fileName = `${baseName}.webp`;
            const fullPath = path.join(outputDir, fileName);

            await sharp(req.file.buffer)
                .toFormat("webp", { quality: parseInt(quality) })
                .toFile(fullPath);

            const publicUrl = "/images/uploads/" + fileName;
            res.json({ url: publicUrl });
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({ error: "Image upload failed." });
        }
    });


    app.post("/convert", upload.array("images"), async (req, res) =>
    {
        let { outputDir, quality } = req.body;

        if (!outputDir)
        {
            return res.status(400).json({ error: "Output directory is required." });
        }

        const isRelative = !path.isAbsolute(outputDir);
        if (isRelative)
        {
            outputDir = path.resolve(projectPath, outputDir);
        }

        if (!await dirExists(outputDir))
        {
            return res.status(400).json({ error: "Invalid output directory." });
        }

        const qualityInt = parseInt(quality, 10);
        if (isNaN(qualityInt) || qualityInt < 0 || qualityInt > 100)
        {
            return res.status(400).json({ error: "Quality must be an integer between 0 and 100." });
        }

        try
        {
            const convertedFiles = [];
            for (const file of req.files)
            {
                const webpTargetPath = path.join(outputDir, `${path.parse(file.originalname).name}.webp`);

                await sharp(file.buffer)
                    .toFormat("webp", { quality: qualityInt })
                    .toFile(webpTargetPath);

                convertedFiles.push(webpTargetPath);
            }

            res.status(200).json({ message: "Images converted successfully.", files: convertedFiles });
        }
        catch (error)
        {
            res.status(500).json({ error: "Image conversion failed.", details: error.message });
        }
    });


    app.get("/api/load-markdown", async (req, res) =>
    {
        try
        {
            const filePath = path.join(projectPath, "contents", req.query.path);
            const content = await fsp.readFile(filePath, "utf-8");
            res.type("text").send(content);
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({ error: "Failed to load file." });
        }
    });

    app.post("/api/save-markdown", async (req, res) =>
    {
        const { path: filePath, content } = req.body;
        try
        {
            const fullFilePath = path.join(projectPath, "contents", filePath);
            await fsp.mkdir(path.dirname(fullFilePath), { recursive: true });
            await fsp.writeFile(fullFilePath, content, "utf-8");
            res.json({ message: "Saved." });
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({ error: "Failed to save file." });
        }
    });


    app.get("/api/list-categories", async (req, res) =>
    {
        try
        {
            const contentsDir = path.join(projectPath, "contents");
            const themes = await fsp.readdir(contentsDir, { withFileTypes: true });
            const result = [];

            for (const themeDir of themes)
            {
                if (!themeDir.isDirectory()) continue;
                const themePath = path.join(contentsDir, themeDir.name);
                const categories = await fsp.readdir(themePath, { withFileTypes: true });

                for (const catDir of categories)
                {
                    if (catDir.isDirectory())
                    {
                        result.push(`${themeDir.name}/${catDir.name}`);
                    }
                }
            }

            res.json(result);
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({ error: "Failed to list categories" });
        }
    });

    app.get("/api/list-markdown", async (req, res) =>
    {
        try
        {
            const category = req.query.category;
            const dir = path.join(projectPath, "contents", category);
            if (!await dirExists(dir)) return res.json([]);
            const files = await getFilesRecursively(dir, [".md"]);
            const relPaths = files.map(f => path.relative(path.join(projectPath, "contents"), f).replace(/\\/g, "/"));
            res.json(relPaths);
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({ error: "Failed to list markdown files." });
        }
    });

    app.delete("/api/delete-markdown", async (req, res) =>
    {
        try
        {
            const filePath = path.resolve(projectPath, "contents", req.query.path);

            if (!filePath.endsWith('.md'))
            {
                return res.status(400).json({ error: "Only .md files can be deleted." });
            }

            await fsp.unlink(filePath);
            res.json({ message: "Deleted successfully." });
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({ error: "Failed to delete file." });
        }
    });

    app.post("/api/run-script", async (req, res) =>
    {
        const { script } = req.body;
        const allowedScripts = [
            "dev",
            "generate",
            "sitemap",
            "feed",
            "generate-all",
            "generate-sitemap"
        ];

        if (!allowedScripts.includes(script))
        {
            return res.status(400).json({ error: "Invalid script name." });
        }

        exec(`npm run ${script}`, { cwd: projectPath }, (error, stdout, stderr) =>
        {
            if (error)
            {
                console.error(stderr);
                return res.status(500).json({ error: stderr });
            }

            console.log(stdout);
            res.json({ output: stdout });
        });
    });

    app.listen(port, () =>
    {
        console.log(`Backoffice running on http://localhost:${port}`);
        console.log("Turn off this window if you are done");
    });

    openBrowser(`http://localhost:${port}`);
}