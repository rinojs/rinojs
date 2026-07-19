import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildStaticSite } from "../src/core/buildStaticSite.js";
import { createMemoryBuildEngine } from "../src/core/memory/buildEngine.js";
import { applyRinoExports, removeRinoExportTags, rinoExportUrl } from "../src/core/memory/rinoExports.js";

const project = path.resolve("temp/rino-export-project");

test("rino export paths are rooted by element type and cannot escape", () =>
{
    assert.equal(rinoExportUrl("style", "/kimchi.css"), "/styles/kimchi.css");
    assert.equal(rinoExportUrl("script", "./nested/kimchi.js"), "/scripts/nested/kimchi.js");
    assert.equal(rinoExportUrl("script", "./nested/kimchi.ts"), "/scripts/nested/kimchi.js");
    assert.throws(() => rinoExportUrl("style", "../outside.css"), /escapes/);
});

test("rino exports append unique blocks to an existing asset", async () =>
{
    const entries = new Map([
        ["/one.html", { body: '<main><style rino-export="/site.css">.shared { color: red; }</style><p>One</p></main>' }],
        ["/two.html", { body: '<style rino-export="./site.css">\n.shared { color: red; }\n</style><style rino-export="site.css">.extra { color: blue; }</style>' }],
        ["/styles/site.css", { body: "body{margin:0}", contentType: "text/css" }]
    ]);

    const output = await applyRinoExports(entries, ["/one.html", "/two.html"]);
    assert.equal(output.get("/styles/site.css").body, "body{margin:0}\n.shared { color: red; }\n.extra { color: blue; }");
    assert.equal(output.get("/one.html").body, "<main><p>One</p></main>");
    assert.equal(output.get("/two.html").body, "");
});

test("rino script exports are bundled by default", async () =>
{
    const entries = new Map([
        ["/index.html", { body: '<script rino-export="/export-demo.js">const world = "ok"; console.log(world);</script><script rino-export="/typed-js.js" rino-type="javascript">console.log("js");</script>' }]
    ]);

    const output = await applyRinoExports(entries, ["/index.html"]);
    const script = output.get("/scripts/export-demo.js").body;
    assert.match(script, /^!?function/);
    assert.match(script, /console\.log\(o\)/);
    assert.match(output.get("/scripts/typed-js.js").body, /^!?function/);
    assert.equal(output.get("/index.html").body, "");
});

test("rino typescript script exports are transpiled and bundled", async () =>
{
    const entries = new Map([
        ["/index.html", { body: '<script rino-export="/typed-demo.ts">const count: number = 2; console.log(count);</script><script rino-export="/typed-demo-explicit.ts" rino-type="typescript">const count: number = 3; console.log(count);</script>' }]
    ]);

    const output = await applyRinoExports(entries, ["/index.html"], { projectPath: process.cwd() });
    const script = output.get("/scripts/typed-demo.js").body;
    const explicitScript = output.get("/scripts/typed-demo-explicit.js").body;
    assert.match(script, /^!?function/);
    assert.match(script, /console\.log\(2\)/);
    assert.match(explicitScript, /console\.log\(3\)/);
    assert.equal(output.get("/index.html").body, "");
});

test("rino export tag removal only removes exporting script and style elements", () =>
{
    const html = [
        '<style>.kept { color: red; }</style>',
        '<script rino-export="/site.js">console.log("exported");</script>',
        '<script type="module">console.log("kept");</script>'
    ].join("");

    assert.equal(
        removeRinoExportTags(html),
        '<style>.kept { color: red; }</style><script type="module">console.log("kept");</script>'
    );
});

test("static generation writes deduplicated component exports", async (t) =>
{
    t.after(() => fsp.rm(project, { recursive: true, force: true }));
    for (const dir of ["pages", "components", "mds", "public", "scripts/export",
        "styles/export", "contents", "content-theme", "i18n"])
    {
        await fsp.mkdir(path.join(project, dir), { recursive: true });
    }
    await fsp.writeFile(path.join(project, "components/shared.html"), '<style rino-export="/shared.css">.shared { display: block; }</style><script rino-export="/shared.ts">const count: number = 1; console.log(count);</script>');
    await fsp.writeFile(path.join(project, "pages/index.html"), '<component rino-path="shared"/>');
    await fsp.writeFile(path.join(project, "pages/about.html"), '<component rino-path="shared"/>');

    const engine = createMemoryBuildEngine(project);
    await engine.buildInitial();
    assert.equal(engine.store.get("/styles/shared.css").body, ".shared { display: block; }");
    assert.match(engine.store.get("/scripts/shared.js").body, /console\.log\(1\)/);
    assert.equal(engine.store.get("/index.html").body, "");

    await fsp.writeFile(path.join(project, "components/shared.html"), '<style rino-export="/shared.css">.shared { display: grid; }</style><script rino-export="/shared.ts">const count: number = 2; console.log(count);</script>');
    await engine.rebuildTemplates([path.join(project, "components/shared.html")]);
    assert.equal(engine.store.get("/styles/shared.css").body, ".shared { display: grid; }");
    assert.match(engine.store.get("/scripts/shared.js").body, /console\.log\(2\)/);
    assert.equal(engine.store.get("/about.html").body, "");

    await buildStaticSite(project);
    const css = await fsp.readFile(path.join(project, "dist/styles/shared.css"), "utf8");
    const js = await fsp.readFile(path.join(project, "dist/scripts/shared.js"), "utf8");
    const html = await fsp.readFile(path.join(project, "dist/index.html"), "utf8");
    assert.equal(css, ".shared { display: grid; }");
    assert.match(js, /console\.log\(2\)/);
    assert.equal(html, "");
});
