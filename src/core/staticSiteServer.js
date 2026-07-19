import chalk from "chalk";
import { defaultMessage } from "./consoleMessages.js";
import { startMemoryServer } from "./server/memoryServer.js";

export async function staticSiteServer(projectPath, port = 3000)
{
    if (!projectPath)
    {
        console.error("Project path does not exist.");
        return;
    }

    const controller = await startMemoryServer(projectPath, port, { watch: true });
    console.log(defaultMessage);
    console.log(chalk.blueBright(`Built ${ controller.engine.store.size } memory outputs in ${ controller.initial.duration }ms`));
    console.log(chalk.blueBright.underline(`http://localhost:${ port }`));
    return controller;
}
