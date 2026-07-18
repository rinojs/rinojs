import path from "node:path";

export const allBuildScopes = ["public", "assets", "pages", "content", "metadata"];

export function scopesForChange(projectPath, filePath)
{
    const relative = path.relative(projectPath, filePath).replace(/\\/g, "/");
    const root = relative.split("/")[0];

    if (root === "public") return ["public"];
    if (root === "scripts" || root === "styles") return ["assets"];
    if (root === "pages" || root === "i18n") return ["pages", "metadata"];
    if (root === "components" || root === "mds") return ["pages", "content"];
    if (root === "content-theme") return ["content"];
    if (root === "contents") return ["pages", "content", "metadata"];
    return allBuildScopes;
}
