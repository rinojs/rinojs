import chalk from "chalk";
import { defaultMessage } from "./consoleMessages.js";
import { DiskOutputStore } from "./memory/diskOutputStore.js";
import { createSiteContext } from "./memory/siteContext.js";
import { buildScopes } from "./memory/siteBuilder.js";

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
    const { entries } = await buildScopes(context, staticScopes);
    await new DiskOutputStore(context.dirs.dist).replace(entries);
    console.log(chalk.blueBright(`\nBuild completed: ${ entries.size } outputs written to ${ context.dirs.dist }\n`));
}
