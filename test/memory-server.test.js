import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { findPort } from "../src/core/find-port.js";
import { startMemoryServer } from "../src/core/server/memoryServer.js";

const project = path.resolve("temp/memory-server-project");

async function createFixture()
{
    for (const dir of ["pages", "components", "mds", "public", "scripts/export", "styles/export", "contents", "content-theme", "i18n"])
    {
        await fsp.mkdir(path.join(project, dir), { recursive: true });
    }
    await fsp.writeFile(path.join(project, "rino-config.js"), "export default {}", "utf8");
    await fsp.writeFile(path.join(project, "pages/index.html"), "<h1>Memory page</h1>", "utf8");
    await fsp.writeFile(path.join(project, "public/large.bin"), Buffer.alloc(1024 * 128, 7));
    await fsp.mkdir(path.join(project, "public/styles"), { recursive: true });
    await fsp.writeFile(path.join(project, "public/styles/main.css"), "/* public wins */", "utf8");
    await fsp.writeFile(path.join(project, "styles/export/main.css"), "body { color: blue; }", "utf8");
}

test("memory server serves prebuilt HTML without request compilation", async (t) =>
{
    await fsp.rm(project, { recursive: true, force: true });
    await createFixture();
    const port = await findPort(34000);
    const controller = await startMemoryServer(project, port, { watch: false });
    t.after(async () =>
    {
        await controller.close();
        await fsp.rm(project, { recursive: true, force: true });
    });

    await fsp.rm(path.join(project, "pages/index.html"));
    assert.equal(controller.engine.store.has("/large.bin"), false);
    const response = await fetch(`http://localhost:${ port }/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Memory page/);

    const missing = await fetch(`http://localhost:${ port }/missing`);
    assert.equal(missing.status, 404);

    const asset = await fetch(`http://localhost:${ port }/large.bin`);
    assert.equal(asset.status, 200);
    assert.equal((await asset.arrayBuffer()).byteLength, 1024 * 128);

    const collision = await fetch(`http://localhost:${ port }/styles/main.css`);
    assert.match(await collision.text(), /public wins/);
    assert.match(controller.engine.store.get("/styles/main.css").body, /body\{color:/);
});
