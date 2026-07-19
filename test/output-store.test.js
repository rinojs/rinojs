import assert from "node:assert/strict";
import test from "node:test";
import { MemoryOutputStore, normalizeOutputUrl } from "../src/core/memory/outputStore.js";
import { outputCandidates } from "../src/core/memory/routes.js";

test("MemoryOutputStore replaces committed snapshots atomically", () =>
{
    const store = new MemoryOutputStore();
    store.write("/index.html", { body: "old", contentType: "text/html" });
    const staged = store.snapshot();
    staged.set("/index.html", { body: "new", contentType: "text/html" });

    assert.equal(store.get("/index.html").body, "old");
    store.replace(staged);
    assert.equal(store.get("/index.html").body, "new");
});

test("memory routes resolve indexes and extensionless HTML", () =>
{
    assert.deepEqual(outputCandidates("/"), ["/index.html"]);
    assert.deepEqual(outputCandidates("/docs/"), ["/docs/index.html"]);
    assert.deepEqual(outputCandidates("/about"), ["/about", "/about.html", "/about/index.html"]);
    assert.equal(normalizeOutputUrl("//styles/main.css"), "/styles/main.css");
});
