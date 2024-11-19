import fs from "fs";
import path from "path";

async function resolveCSSImports(cssContent, baseDir)
{
    const importRegex = /@import\s+['"]([^'"]+)['"];/g;
    let resolvedContent = cssContent;
    let match;

    while ((match = importRegex.exec(resolvedContent)) !== null)
    {
        const importPath = match[1];

        if (/^(https?:|\/\/)/.test(importPath))
        {
            console.warn(`Skipping URL import: ${ importPath }`);
            continue;
        }

        const resolvedPath = path.isAbsolute(importPath)
            ? path.normalize(importPath)
            : path.resolve(baseDir, importPath);

        if (fs.existsSync(resolvedPath))
        {
            const importedCSS = fs.readFileSync(resolvedPath, "utf8");
            const resolvedImportedCSS = await resolveCSSImports(importedCSS, path.dirname(resolvedPath));
            resolvedContent = resolvedContent.replace(match[0], resolvedImportedCSS);
        }
        else
        {
            console.warn(`Could not resolve import: ${ importPath }`);
            resolvedContent = resolvedContent.replace(match[0], `/* Could not resolve: ${ importPath } */`);
        }
    }

    return resolvedContent;
}


export async function bundleCSS(cssContent, baseDir)
{
    const resolvedCSS = await resolveCSSImports(cssContent, baseDir);
    return resolvedCSS;
}