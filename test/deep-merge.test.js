import assert from "node:assert/strict";
import test from "node:test";
import { deepMerge } from "../src/core/deepMerge.js";

test("deepMerge preserves nested fallback keys", () =>
{
    const merged = deepMerge(
        {
            header: {
                title: "Default title",
                subtitle: "Default subtitle"
            },
            list: ["default"],
            footer: "Default footer"
        },
        {
            header: {
                title: "Localized title"
            },
            list: ["localized"]
        }
    );

    assert.deepEqual(merged, {
        header: {
            title: "Localized title",
            subtitle: "Default subtitle"
        },
        list: ["localized"],
        footer: "Default footer"
    });
});
