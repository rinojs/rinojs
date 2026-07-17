export function escapeXmlText(value)
{
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function escapeXmlAttribute(value)
{
    return escapeXmlText(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
