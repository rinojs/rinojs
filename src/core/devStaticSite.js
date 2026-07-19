import chalk from "chalk";
import { openBrowser } from "./browser.js";
import { loadConfig } from "./configLoader.js";
import { defaultMessage } from "./consoleMessages.js";
import { findPort } from "./find-port.js";
import { startMemoryServer } from "./server/memoryServer.js";

export async function devStaticSite(projectPath)
{
    if (!projectPath)
    {
        console.error("Project path does not exist.");
        return;
    }

    const config = await loadConfig(projectPath);
    const port = await findPort(config.port || 3000);
    const controller = await startMemoryServer(projectPath, port, {
        watch: true,
        onBuild(result, changes)
        {
            const action = result.scopes.length
                ? `Rebuilt ${ result.scopes.join(", ") } in ${ result.duration }ms`
                : "Reloaded public files";
            console.log(chalk.green(action));
            console.log(chalk.dim(changes.map(change => `${ change.type }: ${ change.path }`).join("\n")));
        }
    });

    console.log(defaultMessage);
    console.log(chalk.blueBright(`Built ${ controller.engine.store.size } outputs (${ controller.engine.store.bytes } bytes) in ${ controller.initial.duration }ms`));
    console.log(`Development: ${ chalk.blueBright.underline(`http://localhost:${ port }`) }`);
    await openBrowser(`http://localhost:${ port }`);
    return controller;
}
