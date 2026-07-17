import fs from "fs";
import path from "path";

function isInsideDir(filePath, rootDir)
{
    const relativePath = path.relative(rootDir, filePath);
    return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

async function resolveCSSImports(cssContent, baseDir, options)
{
    const importRegex = /@import\s+['"]([^'"]+)['"];/g;
    const rootDir = options.rootDir;
    const visited = options.visited;
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

        if (!isInsideDir(resolvedPath, rootDir))
        {
            console.warn(`Skipping import outside CSS root: ${ importPath }`);
            resolvedContent = resolvedContent.replace(match[0], `/* Skipped outside root: ${ importPath } */`);
            continue;
        }

        if (visited.has(resolvedPath))
        {
            console.warn(`Skipping circular CSS import: ${ importPath }`);
            resolvedContent = resolvedContent.replace(match[0], `/* Skipped circular import: ${ importPath } */`);
            continue;
        }

        if (fs.existsSync(resolvedPath))
        {
            visited.add(resolvedPath);
            const importedCSS = fs.readFileSync(resolvedPath, "utf8");
            const resolvedImportedCSS = await resolveCSSImports(importedCSS, path.dirname(resolvedPath), options);
            visited.delete(resolvedPath);
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


export async function bundleCSS(cssContent, baseDir, options = {})
{
    const rootDir = path.resolve(options.rootDir || baseDir);
    const resolvedCSS = await resolveCSSImports(cssContent, path.resolve(baseDir), {
        rootDir,
        visited: new Set()
    });
    return resolvedCSS;
}
