import path from "node:path";

export function normalizeOutputUrl(value)
{
    const decoded = decodeURIComponent(value || "/").replace(/\\/g, "/");
    const normalized = path.posix.normalize(`/${ decoded }`);

    if (normalized.includes("..")) throw new Error("Output URL escapes the virtual root");
    return normalized;
}

export class MemoryOutputStore
{
    #entries;

    constructor(entries = new Map())
    {
        this.#entries = new Map(entries);
    }

    get(url)
    {
        return this.#entries.get(normalizeOutputUrl(url));
    }

    has(url)
    {
        return this.#entries.has(normalizeOutputUrl(url));
    }

    write(url, entry)
    {
        const key = normalizeOutputUrl(url);
        const body = entry.body ?? entry;
        this.#entries.set(key, Object.freeze({
            body,
            contentType: entry.contentType,
            builtAt: entry.builtAt || Date.now()
        }));
    }

    delete(url)
    {
        return this.#entries.delete(normalizeOutputUrl(url));
    }

    list()
    {
        return [...this.#entries.keys()].sort();
    }

    snapshot()
    {
        return new Map(this.#entries);
    }

    replace(entries)
    {
        this.#entries = new Map(entries);
    }

    get size()
    {
        return this.#entries.size;
    }

    get bytes()
    {
        return [...this.#entries.values()].reduce((total, entry) =>
            total + Buffer.byteLength(entry.body), 0);
    }
}
