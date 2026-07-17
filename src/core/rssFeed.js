import fsp from "fs/promises";
import { escapeXmlText } from "./xmlEscape.js";

export async function generateRSSFeed (contentItems, siteUrl)
{
  if (!contentItems.length || !siteUrl.length) return "";

  const pubDate = new Date().toUTCString();
  const rssItems = contentItems.map(({ title, link }) => `
      <item>
        <title>${escapeXmlText(title)}</title>
        <link>${escapeXmlText(link)}</link>
        <guid>${escapeXmlText(link)}</guid>
        <pubDate>${pubDate}</pubDate>
      </item>
    `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXmlText(siteUrl)}</title>
        <link>${escapeXmlText(siteUrl)}</link>
        <description>RSS Feed for content of ${escapeXmlText(siteUrl)}</description>
        <lastBuildDate>${pubDate}</lastBuildDate>
        ${rssItems}
      </channel>
    </rss>`;

  return rss;
}

export async function generateRSSFeedFile (contentItems, filename, siteUrl)
{
  try
  {
    if (!contentItems.length) return false;

    const pubDate = new Date().toUTCString();
    const rssItems = contentItems.map(({ title, link }) => `
      <item>
        <title>${escapeXmlText(title)}</title>
        <link>${escapeXmlText(link)}</link>
        <guid>${escapeXmlText(link)}</guid>
        <pubDate>${pubDate}</pubDate>
      </item>
    `).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXmlText(siteUrl)}</title>
        <link>${escapeXmlText(siteUrl)}</link>
        <description>${escapeXmlText(siteUrl)} RSS Feed</description>
        <lastBuildDate>${pubDate}</lastBuildDate>
        ${rssItems}
      </channel>
    </rss>`;

    await fsp.writeFile(filename, rss, "utf8");
    return true;
  }
  catch (error)
  {
    console.error(error);
    return false;
  }
}
