import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildTemplateDependencyGraph } from "../src/core/memory/templateDependencyGraph.js";

const root = path.resolve("temp/template-graph-project");

test("template graph follows nested component and Markdown edges safely", async (t) =>
{
    t.after(() => fsp.rm(root, { recursive: true, force: true }));
    for (const dir of ["pages", "components", "mds", "content-theme/blog"])
    {
        await fsp.mkdir(path.join(root, dir), { recursive: true });
    }
    await fsp.writeFile(path.join(root, "pages/index.html"), '<component rino-import="shared"/>', "utf8");
    await fsp.writeFile(path.join(root, "pages/about.html"), "<h1>About</h1>", "utf8");
    await fsp.writeFile(path.join(root, "pages/future.html"), '<component rino-import="not-created-yet"/>', "utf8");
    await fsp.writeFile(path.join(root, "components/shared.html"), '<component rino-import="nested"/>', "utf8");
    await fsp.writeFile(path.join(root, "components/nested.html"), '<component rino-import="shared"/><script rino-type="md" rino-import="intro"></script>', "utf8");
    await fsp.writeFile(path.join(root, "mds/intro.md"), "# Intro", "utf8");
    await fsp.writeFile(path.join(root, "content-theme/blog/content.html"), '<component rino-import="shared"/>', "utf8");
    await fsp.writeFile(path.join(root, "content-theme/blog/content-list.html"), "<main>List</main>", "utf8");

    const context = { dirs: {
        pages: path.join(root, "pages"),
        components: path.join(root, "components"),
        mds: path.join(root, "mds"),
        contentTheme: path.join(root, "content-theme")
    } };
    const graph = await buildTemplateDependencyGraph(context);
    const markdown = graph.affectedBy(path.join(root, "mds/intro.md"));
    assert.deepEqual([...markdown.pages], [path.join(root, "pages/index.html")]);
    assert.deepEqual([...markdown.themes], ["blog"]);

    const unrelated = graph.affectedBy(path.join(root, "components/unused.html"));
    assert.equal(unrelated.pages.size, 0);
    assert.equal(unrelated.themes.size, 0);

    const unresolved = graph.affectedBy(path.join(root, "components/not-created-yet.html"));
    assert.deepEqual([...unresolved.pages], [path.join(root, "pages/future.html")]);
});
