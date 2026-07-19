import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { WebSocket } from "ws";
import { findPort } from "../src/core/find-port.js";
import { startMemoryServer } from "../src/core/server/memoryServer.js";

const project = path.resolve("temp/public-reload-project");

function once(target, event)
{
    return new Promise(resolve => target.once(event, resolve));
}

test("a debounced public file change sends one browser reload", async (t) =>
{
    for (const dir of ["pages", "public", "components", "mds", "scripts/export",
        "styles/export", "contents", "content-theme", "i18n"])
    {
        await fsp.mkdir(path.join(project, dir), { recursive: true });
    }
    await fsp.writeFile(path.join(project, "pages/index.html"), "<h1>Page</h1>");
    const asset = path.join(project, "public/app.txt");
    await fsp.writeFile(asset, "first");
    await fsp.mkdir(path.join(project, "public/test"), { recursive: true });
    await fsp.writeFile(path.join(project, "public/test/index.html"), "<h1>Public page</h1>");

    const port = await findPort(34100);
    const controller = await startMemoryServer(project, port, { watch: true });
    const socket = new WebSocket(`ws://localhost:${ port }`);
    t.after(async () =>
    {
        socket.close();
        await controller.close();
        await fsp.rm(project, { recursive: true, force: true });
    });
    await once(socket, "open");

    const publicPage = await fetch(`http://localhost:${ port }/test/`);
    const publicHtml = await publicPage.text();
    assert.match(publicHtml, /Public page/);
    assert.match(publicHtml, /new WebSocket\('ws:\/\/localhost:/);

    let reloads = 0;
    socket.on("message", message =>
    {
        if (message.toString() === "reload") reloads += 1;
    });
    await fsp.writeFile(asset, "second");
    await new Promise(resolve => setTimeout(resolve, 250));

    assert.equal(reloads, 1);
    assert.equal(controller.engine.store.has("/app.txt"), false);
});
