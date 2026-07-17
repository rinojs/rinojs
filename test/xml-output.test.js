import assert from "node:assert/strict";
import test from "node:test";
import { generateAtomFeed } from "../src/core/atomFeed.js";
import { generateRSSFeed } from "../src/core/rssFeed.js";
import { generateSitemap } from "../src/core/sitemap.js";

test("RSS output escapes dynamic XML text", async () =>
{
    const xml = await generateRSSFeed(
        [{ title: "A & B < C", link: "https://example.com/?a=1&b=<x>" }],
        "https://example.com/?site=R&D"
    );

    assert.match(xml, /A &amp; B &lt; C/);
    assert.match(xml, /https:\/\/example.com\/\?a=1&amp;b=&lt;x&gt;/);
    assert.doesNotMatch(xml, /A & B < C/);
});

test("Atom output escapes text and attribute values", async () =>
{
    const xml = await generateAtomFeed(
        [{ title: "Title \"quoted\" & tagged", link: "https://example.com/?q=\"x\"&y='z'" }],
        "https://example.com"
    );

    assert.match(xml, /Title "quoted" &amp; tagged/);
    assert.match(xml, /href="https:\/\/example.com\/\?q=&quot;x&quot;&amp;y=&apos;z&apos;"/);
});

test("sitemap output escapes URL text", async () =>
{
    const xml = await generateSitemap(["https://example.com/search?q=a&tag=<news>"]);

    assert.match(xml, /https:\/\/example.com\/search\?q=a&amp;tag=&lt;news&gt;/);
});
