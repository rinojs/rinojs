import path from "path";

export function getStaticBuildDirs(projectPath, config)
{
    return {
        pages: path.join(projectPath, "pages"),
        components: path.join(projectPath, "components"),
        public: path.join(projectPath, "public"),
        scripts: path.join(projectPath, "scripts/export"),
        styles: path.join(projectPath, "styles/export"),
        mds: path.join(projectPath, "mds"),
        contents: path.join(projectPath, "contents"),
        contentTheme: path.join(projectPath, "content-theme"),
        dist: config.dist ? path.resolve(projectPath, config.dist) : path.resolve(projectPath, "./dist"),
    };
}
