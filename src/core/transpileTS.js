import fsp from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectTempDir = path.resolve("temp/rino-ts");
let nextBuildId = 1;
const require = createRequire(import.meta.url);

function tscPath()
{
    return path.join(path.dirname(require.resolve("typescript/package.json")), "bin/tsc");
}

function outputFileFor(sourcePath, sourceRoot, outputRoot)
{
    const relative = path.relative(sourceRoot, sourcePath).replace(/\.[cm]?tsx?$/i, ".js");
    return path.join(outputRoot, relative);
}

async function fileExists(filePath)
{
    try
    {
        await fsp.access(filePath);
        return true;
    }
    catch
    {
        return false;
    }
}

async function runTSC(args, projectPath, outputPath)
{
    try
    {
        await execFileAsync(process.execPath, [tscPath(), ...args], { cwd: projectPath });
    }
    catch (error)
    {
        if (await fileExists(outputPath)) return;
        throw new Error(error.stderr || error.stdout || error.message);
    }
}

export async function transpileTSFile(scriptPath, projectPath)
{
    const sourceRoot = path.dirname(path.resolve(scriptPath));
    const buildRoot = path.join(projectTempDir, `file-${ process.pid }-${ nextBuildId++ }`);
    const outputRoot = path.join(buildRoot, "out");
    const outputPath = outputFileFor(path.resolve(scriptPath), sourceRoot, outputRoot);

    await fsp.mkdir(outputRoot, { recursive: true });
    await runTSC([
        path.resolve(scriptPath),
        "--ignoreConfig",
        "--outDir", outputRoot,
        "--rootDir", sourceRoot,
        "--module", "ESNext",
        "--target", "ES2020",
        "--sourceMap", "false",
        "--inlineSourceMap", "false",
        "--declaration", "false",
        "--declarationMap", "false",
        "--noEmitOnError", "false",
        "--skipLibCheck", "true"
    ], projectPath, outputPath);

    return outputPath;
}

export async function transpileTSCode(code, projectPath, name = "tsbundle")
{
    const buildRoot = path.join(projectTempDir, `inline-${ process.pid }-${ nextBuildId++ }`);
    const sourceRoot = path.join(buildRoot, "src");
    const sourcePath = path.join(sourceRoot, `${ name }.ts`);
    const outputRoot = path.join(buildRoot, "out");
    const outputPath = outputFileFor(sourcePath, sourceRoot, outputRoot);

    await fsp.mkdir(sourceRoot, { recursive: true });
    await fsp.writeFile(sourcePath, code, "utf8");

    await runTSC([
        sourcePath,
        "--ignoreConfig",
        "--outDir", outputRoot,
        "--rootDir", sourceRoot,
        "--module", "ESNext",
        "--target", "ES2020",
        "--sourceMap", "false",
        "--inlineSourceMap", "false",
        "--declaration", "false",
        "--declarationMap", "false",
        "--noEmitOnError", "false",
        "--skipLibCheck", "true"
    ], projectPath, outputPath);

    return await fsp.readFile(outputPath, "utf8");
}
