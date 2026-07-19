import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { closeTemplateScriptRunners, getResultFromCode } from "../src/core/scriptRenderer.js";

test("template script runner reuses an isolated child process for JS modules", async (t) =>
{
    const tempDir = path.resolve("temp/script-renderer-test");
    t.after(async () =>
    {
        closeTemplateScriptRunners();
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    await fsp.mkdir(tempDir, { recursive: true });

    const first = await getResultFromCode(
        'import os from "os"; console.log(process.argv[1]); console.log(os.type());',
        tempDir,
        ["first-arg"]
    );
    const second = await getResultFromCode(
        "const value = 2; console.log(value);",
        tempDir
    );

    assert.match(first, /^first-arg\n/);
    assert.equal(second, "2");
});
