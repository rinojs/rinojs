import assert from "node:assert/strict";
import test from "node:test";
import { injectReload } from "../src/core/inject-reload.js";

test("injectReload appends script without replacing head tags", async () =>
{
    const html = "<html><head><title>Test</title></head><body>Page</body></html>";
    const result = await injectReload(html, 3000);

    assert.match(result, /<head><title>Test<\/title><\/head>/);
    assert.match(result, /<body>Page<\/body><\/html>/);
    assert.match(result, /new WebSocket\('ws:\/\/localhost:3000'\)/);
    assert.ok(result.indexOf("</html>") < result.indexOf("new WebSocket"));
});
