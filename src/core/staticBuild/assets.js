import fsp from "fs/promises";
import path from "path";
import chalk from "chalk";
import CleanCSS from "clean-css";
import { bundleCSS } from "../bundleCSS.js";
import { bundleJS } from "../bundleJS.js";
import { bundleTS } from "../bundleTS.js";
import { dirExists, getFilesRecursively } from "../fsHelper.js";

export async function buildStaticAssets(projectPath, dirs)
{
    await buildStaticScripts(dirs);
    await buildStaticTypeScript(projectPath, dirs);
    await buildStaticStyles(dirs);
}

async function buildStaticScripts(dirs)
{
    const scripts = await getFilesRecursively(dirs.scripts, [".js", ".mjs"]);

    for (const scriptPath of scripts)
    {
        const relativePath = path.relative(dirs.scripts, scriptPath);
        const distScriptPath = path.join(dirs.dist, "scripts", relativePath);
        await ensureParentDir(distScriptPath);

        const scriptContent = await bundleJS(
            scriptPath,
            path.basename(scriptPath, path.extname(scriptPath))
        );

        await fsp.writeFile(distScriptPath, scriptContent, "utf8");

        console.log(chalk.greenBright(`Script generated: ${ distScriptPath }`));
    }
}

async function buildStaticTypeScript(projectPath, dirs)
{
    const tsScripts = await getFilesRecursively(dirs.scripts, [".ts"]);

    for (const scriptPath of tsScripts)
    {
        const relativePath = path.relative(dirs.scripts, scriptPath);
        const distScriptPath = path.join(dirs.dist, "scripts", relativePath);
        await ensureParentDir(distScriptPath);

        const scriptContent = await bundleTS(
            scriptPath,
            projectPath,
            path.basename(scriptPath, path.extname(scriptPath))
        );

        await fsp.writeFile(distScriptPath.replace(".ts", ".js"), scriptContent, "utf8");

        console.log(chalk.greenBright(`Typescript compiled: ${ distScriptPath }`));
    }
}

async function buildStaticStyles(dirs)
{
    const styles = await getFilesRecursively(dirs.styles, [".css"]);
    const cccs = new CleanCSS();

    for (const stylePath of styles)
    {
        const relativePath = path.relative(dirs.styles, stylePath);
        const distStylePath = path.join(dirs.dist, "styles", relativePath);
        await ensureParentDir(distStylePath);

        let styleContent = await bundleCSS(
            await fsp.readFile(stylePath, "utf8"),
            path.dirname(stylePath),
            { rootDir: path.dirname(dirs.styles) }
        );

        styleContent = cccs.minify(styleContent).styles;
        await fsp.writeFile(distStylePath, styleContent, "utf8");

        console.log(chalk.greenBright(`Style generated: ${ distStylePath }`));
    }
}

async function ensureParentDir(filePath)
{
    const dir = path.dirname(filePath);

    if (!await dirExists(dir))
    {
        await fsp.mkdir(dir, { recursive: true });
    }
}
