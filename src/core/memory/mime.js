import path from "node:path";

const types = new Map([
    [".css", "text/css; charset=utf-8"],
    [".html", "text/html; charset=utf-8"],
    [".js", "application/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".pdf", "application/pdf"],
    [".txt", "text/plain; charset=utf-8"],
    [".xml", "application/xml; charset=utf-8"],
    [".ico", "image/x-icon"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".svg", "image/svg+xml"],
    [".webp", "image/webp"],
    [".woff", "font/woff"],
    [".woff2", "font/woff2"]
]);

export function contentTypeFor(filePath)
{
    return types.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}
