export function jsBundleName(value, fallback = "jsbundle")
{
    const name = value.replace(/[^a-zA-Z0-9_$]/g, "_");
    if (/^[a-zA-Z_$]/.test(name)) return name;
    return `${ fallback }_${ name }`;
}
