import path from "path";
import chalk from "chalk";
import url from "url";
import { fileExists } from "./fsHelper.js";

export async function loadConfig (projectPath)
{
    const configPath = path.join(projectPath, "rino-config.js");
    let config = {
        dist: "./dist",
        port: 3000,
        site: {
            url: "https://example.com",
        },
        sitemap: [
        ],
    }

    if (await fileExists(configPath))
    {
        try
        {
            const configModule = await import(url.pathToFileURL(configPath));
            config = { ...config, ...configModule.default };

            console.log(chalk.greenBright("Configuration loaded successfully! \n"));
        }
        catch (error)
        {
            console.error(
                chalk.redBright("Error loading configuration file:"),
                error
            );
        }
    }
    else
    {
        console.log(
            chalk.yellowBright(
                "No rino-config.js found. Using default configuration."
            )
        );
    }

    return config;
}