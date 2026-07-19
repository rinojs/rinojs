import path from "node:path";
import ts from "typescript";
import { bundleGeneralJS } from "./bundleGeneralJS.js";

function compilerOptions(projectPath)
{
    const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists, "tsconfig.json");
    if (!configPath) return {};

    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    if (config.error) return {};

    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
    return parsed.options;
}

export async function bundleGeneralTS(code, projectPath, name = "tsbundle")
{
    const transpiled = ts.transpileModule(code, {
        compilerOptions: {
            ...compilerOptions(projectPath),
            module: ts.ModuleKind.ESNext
        }
    });

    return await bundleGeneralJS(transpiled.outputText, name);
}
