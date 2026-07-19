import { bundleGeneralJS } from "./bundleGeneralJS.js";
import { transpileTSCode } from "./transpileTS.js";

export async function bundleGeneralTS(code, projectPath, name = "tsbundle")
{
    return await bundleGeneralJS(await transpileTSCode(code, projectPath, name), name);
}
