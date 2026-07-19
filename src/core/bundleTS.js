import { bundleJS } from "./bundleJS.js";
import { transpileTSFile } from "./transpileTS.js";

export async function bundleTS(scriptPath, projectPath, name = "tsbundle")
{
    const jsPath = await transpileTSFile(scriptPath, projectPath);
    return await bundleJS(jsPath, name);
}
