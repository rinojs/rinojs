import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildStaticSite } from "../src/core/buildStaticSite.js";
import { createMemoryBuildEngine } from "../src/core/memory/buildEngine.js";
import { applyRinoExports, rinoExportUrl } from "../src/core/memory/rinoExports.js";

const project = path.resolve("temp/rino-export-project");

test("rino export paths are rooted by element type and cannot escape", () =>
{
    assert.equal(rinoExportUrl("style", "/kimchi.css"), "/styles/kimchi.css");
    assert.equal(rinoExportUrl("script", "./nested/kimchi.js"), "/scripts/nested/kimchi.js");
    assert.throws(() => rinoExportUrl("style", "../outside.css"), /escapes/);
});

test("rino exports append unique blocks to an existing asset", () =>
{
    const entries = new Map([
        ["/one.html", { body: '<style rino-export="/site.css">.shared { color: red; }</style>' }],
        ["/two.html", { body: '<style rino-export="./site.css">\n.shared { color: red; }\n</style><style rino-export="site.css">.extra { color: blue; }</style>' }],
        ["/styles/site.css", { body: "body{margin:0}", contentType: "text/css" }]
    ]);

    const output = applyRinoExports(entries, ["/one.html", "/two.html"]);
    assert.equal(output.get("/styles/site.css").body, "body{margin:0}\n.shared { color: red; }\n.extra { color: blue; }");
    assert.match(output.get("/one.html").body, /rino-export/);
});

test("static generation writes deduplicated component exports", async (t) =>
{
    t.after(() => fsp.rm(project, { recursive: true, force: true }));
    for (const dir of ["pages", "components", "mds", "public", "scripts/export",
        "styles/export", "contents", "content-theme", "i18n"])
    {
        await fsp.mkdir(path.join(project, dir), { recursive: true });
    }
    await fsp.writeFile(path.join(project, "components/shared.html"), '<style rino-export="/shared.css">.shared { display: block; }</style>');
    await fsp.writeFile(path.join(project, "pages/index.html"), '<component rino-path="shared"/>');
    await fsp.writeFile(path.join(project, "pages/about.html"), '<component rino-path="shared"/>');

    const engine = createMemoryBuildEngine(project);
    await engine.buildInitial();
    assert.equal(engine.store.get("/styles/shared.css").body, ".shared { display: block; }");

    await fsp.writeFile(path.join(project, "components/shared.html"), '<style rino-export="/shared.css">.shared { display: grid; }</style>');
    await engine.rebuildTemplates([path.join(project, "components/shared.html")]);
    assert.equal(engine.store.get("/styles/shared.css").body, ".shared { display: grid; }");

    await buildStaticSite(project);
    const css = await fsp.readFile(path.join(project, "dist/styles/shared.css"), "utf8");
    assert.equal(css, ".shared { display: grid; }");
});
