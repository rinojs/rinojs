import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { allBuildScopes, scopesForChange } from "../src/core/memory/invalidation.js";

const project = path.resolve("temp/invalidation-project");

test("source changes map to conservative related build scopes", () =>
{
    assert.deepEqual(scopesForChange(project, path.join(project, "styles/main.css")), ["assets"]);
    assert.deepEqual(scopesForChange(project, path.join(project, "components/nav.html")), ["pages", "content"]);
    assert.deepEqual(scopesForChange(project, path.join(project, "contents/blog/post.md")), ["pages", "content", "metadata"]);
    assert.deepEqual(scopesForChange(project, path.join(project, "rino-config.js")), allBuildScopes);
});
