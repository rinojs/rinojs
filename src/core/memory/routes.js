import path from "node:path";
import { normalizeOutputUrl } from "./outputStore.js";

export function outputCandidates(requestPath)
{
    const url = normalizeOutputUrl(requestPath);
    if (url === "/") return ["/index.html"];
    if (url.endsWith("/")) return [`${ url }index.html`];
    if (path.posix.extname(url)) return [url];
    return [url, `${ url }.html`, `${ url }/index.html`];
}
