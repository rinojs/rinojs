import chalk from "chalk";
import { defaultMessage } from "./consoleMessages.js";
import { DiskOutputStore } from "./memory/diskOutputStore.js";
import { createSiteContext } from "./memory/siteContext.js";
import { buildScopes } from "./memory/siteBuilder.js";
import { applyRinoExports } from "./memory/rinoExports.js";

const staticScopes = ["public", "assets", "pages", "content"];

export async function buildStaticSite(projectPath)
{
    if (!projectPath)
    {
        console.error("Project path does not exist.");
        return;
    }

    console.clear();
    console.log(defaultMessage);
    const context = await createSiteContext(projectPath);
    const built = await buildScopes(context, staticScopes);
    const htmlUrls = new Set([
        ...(built.urlsByScope.get("pages") || []),
        ...(built.urlsByScope.get("content") || [])
    ]);
    const entries = applyRinoExports(built.entries, htmlUrls);
    await new DiskOutputStore(context.dirs.dist).replace(entries);
    console.log(chalk.blueBright(`\nBuild completed: ${ entries.size } outputs written to ${ context.dirs.dist }\n`));
}
