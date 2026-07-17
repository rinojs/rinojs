import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { bundleCSS } from "../src/core/bundleCSS.js";

const tempDir = path.resolve("temp/css-bundle-test");
const rootDir = path.join(tempDir, "root");

test("bundleCSS skips imports outside the configured root", async (t) =>
{
    const originalWarn = console.warn;
    console.warn = () => {};

    t.after(async () =>
    {
        console.warn = originalWarn;
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    await fsp.rm(tempDir, { recursive: true, force: true });
    await fsp.mkdir(rootDir, { recursive: true });
    await fsp.writeFile(path.join(tempDir, "outside.css"), ".outside { color: red; }", "utf8");

    const css = await bundleCSS('@import "../outside.css";\n.safe { color: green; }', rootDir, { rootDir });

    assert.match(css, /Skipped outside root/);
    assert.doesNotMatch(css, /\.outside/);
    assert.match(css, /\.safe/);
});

test("bundleCSS skips circular imports", async (t) =>
{
    const originalWarn = console.warn;
    console.warn = () => {};

    t.after(async () =>
    {
        console.warn = originalWarn;
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    await fsp.rm(tempDir, { recursive: true, force: true });
    await fsp.mkdir(rootDir, { recursive: true });
    await fsp.writeFile(path.join(rootDir, "a.css"), '@import "./b.css";\n.a { color: blue; }', "utf8");
    await fsp.writeFile(path.join(rootDir, "b.css"), '@import "./a.css";\n.b { color: green; }', "utf8");

    const css = await bundleCSS('@import "./a.css";', rootDir, { rootDir });

    assert.match(css, /Skipped circular import/);
    assert.match(css, /\.a/);
    assert.match(css, /\.b/);
});
