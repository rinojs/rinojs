import fsp from "fs/promises";

export async function generateAtomFeed (contentItems, siteUrl)
{
  if (!contentItems.length || !siteUrl.length) return "";

  const updated = new Date().toISOString();
  const atomEntries = contentItems.map(({ title, link }) => `
      <entry>
        <title>${title}</title>
        <link href="${link}" />
        <id>${link}</id>
        <updated>${updated}</updated>
      </entry>
    `).join('');

  const atom = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>${siteUrl} Atom Feed</title>
      <link href="${siteUrl}" />
      <updated>${updated}</updated>
      <id>${siteUrl}/feed</id>
      ${atomEntries}
    </feed>`;

  return atom;
}

export async function generateAtomFeedFile (contentItems, filename, siteUrl)
{
  try
  {
    if (!contentItems.length || !siteUrl.length) return false;

    const updated = new Date().toISOString();
    const atomEntries = contentItems.map(({ title, link }) => `
      <entry>
        <title>${title}</title>
        <link href="${link}" />
        <id>${link}</id>
        <updated>${updated}</updated>
      </entry>
    `).join('');

    const atom = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>${siteUrl} Atom Feed</title>
      <link href="${siteUrl}" />
      <updated>${updated}</updated>
      <id>${siteUrl}/feed</id>
      ${atomEntries}
    </feed>`;

    await fsp.writeFile(filename, atom, "utf8");
    return true;
  }
  catch (error)
  {
    console.error(error);
    return false;
  }
}