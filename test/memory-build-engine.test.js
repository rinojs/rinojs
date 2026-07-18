import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { createMemoryBuildEngine } from "../src/core/memory/buildEngine.js";

const project = path.resolve("temp/memory-build-project");

async function fixture()
{
    for (const dir of ["pages", "components", "mds", "public", "scripts/export", "styles/export", "contents", "content-theme", "i18n"])
    {
        await fsp.mkdir(path.join(project, dir), { recursive: true });
    }
    await fsp.writeFile(path.join(project, "rino-config.js"), "export default { site: { url: 'https://example.com' }, sitemap: [], i18n: { defaultLocale: 'en', locales: ['en'] } }", "utf8");
    await fsp.writeFile(path.join(project, "components/title.html"), "<h1>First</h1>", "utf8");
    await fsp.writeFile(path.join(project, "pages/index.html"), '<component rino-path="title"/>', "utf8");
    await fsp.writeFile(path.join(project, "public/logo.svg"), "<svg></svg>", "utf8");
    await fsp.writeFile(path.join(project, "styles/export/main.css"), "body { color: red; }", "utf8");
}

test("memory engine builds once and atomically replaces affected scopes", async (t) =>
{
    t.after(() => fsp.rm(project, { recursive: true, force: true }));
    await fsp.rm(project, { recursive: true, force: true });
    await fixture();

    const engine = createMemoryBuildEngine(project);
    await engine.buildInitial();
    assert.match(engine.store.get("/index.html").body, /First/);
    assert.ok(Buffer.isBuffer(engine.store.get("/logo.svg").body));
    assert.match(engine.store.get("/styles/main.css").body, /color:red/);

    await fsp.writeFile(path.join(project, "components/title.html"), "<h1>Second</h1>", "utf8");
    const result = await engine.rebuildChanged(path.join(project, "components/title.html"));
    assert.deepEqual(result.scopes, ["pages", "content"]);
    assert.match(engine.store.get("/index.html").body, /Second/);
    assert.equal(engine.buildId, 2);
});

test("failed rebuild retains the last committed output", async (t) =>
{
    t.after(() => fsp.rm(project, { recursive: true, force: true }));
    await fsp.rm(project, { recursive: true, force: true });
    await fixture();
    const engine = createMemoryBuildEngine(project);
    await engine.buildInitial();

    await fsp.mkdir(path.join(project, "i18n/en"), { recursive: true });
    await fsp.writeFile(path.join(project, "i18n/en/index.json"), "{ invalid", "utf8");
    const previous = engine.store.get("/index.html").body;

    await assert.rejects(engine.rebuild(["pages"]));
    assert.equal(engine.store.get("/index.html").body, previous);
    assert.equal(engine.buildId, 1);
});

test("template rebuild changes only dependent page entries", async (t) =>
{
    t.after(() => fsp.rm(project, { recursive: true, force: true }));
    await fsp.rm(project, { recursive: true, force: true });
    await fixture();
    await fsp.writeFile(path.join(project, "pages/about.html"), "<h1>Unrelated</h1>", "utf8");
    const engine = createMemoryBuildEngine(project);
    await engine.buildInitial();
    const aboutBuiltAt = engine.store.get("/about.html").builtAt;

    await fsp.writeFile(path.join(project, "components/title.html"), "<h1>Targeted</h1>", "utf8");
    const result = await engine.rebuildTemplates([path.join(project, "components/title.html")]);

    assert.deepEqual(result.changedUrls, ["/index.html"]);
    assert.match(engine.store.get("/index.html").body, /Targeted/);
    assert.equal(engine.store.get("/about.html").builtAt, aboutBuiltAt);
});
