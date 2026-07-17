import fsp from "fs/promises";
import { escapeXmlAttribute, escapeXmlText } from "./xmlEscape.js";

export async function generateAtomFeed (contentItems, siteUrl)
{
  if (!contentItems.length || !siteUrl.length) return "";

  const updated = new Date().toISOString();
  const atomEntries = contentItems.map(({ title, link }) => `
      <entry>
        <title>${escapeXmlText(title)}</title>
        <link href="${escapeXmlAttribute(link)}" />
        <id>${escapeXmlText(link)}</id>
        <updated>${updated}</updated>
      </entry>
    `).join('');

  const atom = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>${escapeXmlText(siteUrl)} Atom Feed</title>
      <link href="${escapeXmlAttribute(siteUrl)}" />
      <updated>${updated}</updated>
      <id>${escapeXmlText(siteUrl)}/feed</id>
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
        <title>${escapeXmlText(title)}</title>
        <link href="${escapeXmlAttribute(link)}" />
        <id>${escapeXmlText(link)}</id>
        <updated>${updated}</updated>
      </entry>
    `).join('');

    const atom = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>${escapeXmlText(siteUrl)} Atom Feed</title>
      <link href="${escapeXmlAttribute(siteUrl)}" />
      <updated>${updated}</updated>
      <id>${escapeXmlText(siteUrl)}/feed</id>
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
