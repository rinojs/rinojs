import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildCategoryLinks } from "../src/core/server/categoryLinks.js";

const tempDir = path.resolve("temp/category-links-test");

test("buildCategoryLinks returns first list URL for categories with markdown", async (t) =>
{
    t.after(async () =>
    {
        await fsp.rm(tempDir, { recursive: true, force: true });
    });

    await fsp.rm(tempDir, { recursive: true, force: true });
    await fsp.mkdir(path.join(tempDir, "en", "blog"), { recursive: true });
    await fsp.mkdir(path.join(tempDir, "en", "empty"), { recursive: true });
    await fsp.mkdir(path.join(tempDir, "ko", "테스트"), { recursive: true });
    await fsp.writeFile(path.join(tempDir, "en", "blog", "1-first.md"), "# First", "utf8");
    await fsp.writeFile(path.join(tempDir, "ko", "테스트", "1-테스트.md"), "# Test", "utf8");

    const links = await buildCategoryLinks(tempDir);

    assert.deepEqual(links, {
        "en/blog": "/contents-list/en/blog/blog-1",
        "ko/테스트": "/contents-list/ko/테스트/테스트-1"
    });
});
