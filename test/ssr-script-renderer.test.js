import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildSSRComponent } from "../src/core/ssr/ssrComponent.js";
import { closeTemplateScriptRunners } from "../src/core/scriptRenderer.js";

const tempDir = path.resolve("temp/ssr-script-renderer-test");

test("SSR component scripts use the shared JS and TS template runner", async (t) =>
{
    t.after(async () =>
    {
        closeTemplateScriptRunners();
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    await fsp.mkdir(tempDir, { recursive: true });
    const pagePath = path.join(tempDir, "page.html");
    await fsp.writeFile(pagePath, [
        '<script rino-type="js">console.log("ssr js")</script>',
        '<script rino-type="ts">const value: string = "ssr ts"; console.log(value);</script>'
    ].join(""), "utf8");

    const output = await buildSSRComponent(pagePath, tempDir, tempDir);

    assert.equal(output, "ssr jsssr ts");
});
