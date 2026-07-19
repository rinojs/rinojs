import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { bundleTS } from "../src/core/bundleTS.js";

const project = path.resolve("temp/bundle-ts-project");

test("bundleTS transpiles and bundles relative TypeScript imports", async (t) =>
{
    t.after(() => fsp.rm(project, { recursive: true, force: true }));

    await fsp.mkdir(path.join(project, "scripts/export"), { recursive: true });
    await fsp.writeFile(path.join(project, "tsconfig.json"), JSON.stringify({
        compilerOptions: {
            target: "ES2020",
            module: "ESNext"
        }
    }), "utf8");
    await fsp.writeFile(path.join(project, "scripts/export/message.ts"), "export const message: string = 'bundled ts';", "utf8");
    await fsp.writeFile(path.join(project, "scripts/export/main.ts"), "import { message } from './message'; console.log(message);", "utf8");

    const output = await bundleTS(path.join(project, "scripts/export/main.ts"), project, "main");

    assert.match(output, /^!?function/);
    assert.match(output, /bundled ts/);
    assert.match(output, /console\.log\(/);
});
