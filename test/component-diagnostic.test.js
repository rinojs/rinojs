import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildComponent } from "../src/core/component.js";

const tempDir = path.resolve("temp/component-diagnostic-test");

test("buildComponent returns a diagnostic string for render errors", async (t) =>
{
    const originalError = console.error;
    console.error = () => {};

    t.after(async () =>
    {
        console.error = originalError;
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    await fsp.rm(tempDir, { recursive: true, force: true });
    await fsp.mkdir(tempDir, { recursive: true });

    const pagePath = path.join(tempDir, "page.html");
    await fsp.writeFile(
        pagePath,
        '<script rino-type="js">throw new Error("template failed")</script>',
        "utf8"
    );

    const output = await buildComponent(pagePath, tempDir, tempDir);

    assert.equal(typeof output, "string");
    assert.match(output, /Building component failed/);
    assert.match(output, /template failed/);
});
