import fsp from "fs/promises";

export async function generateRSSFeed (contentItems, siteUrl)
{
  if (!contentItems.length || !siteUrl.length) return "";

  const pubDate = new Date().toUTCString();
  const rssItems = contentItems.map(({ title, link }) => `
      <item>
        <title>${title}</title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${pubDate}</pubDate>
      </item>
    `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${siteUrl}</title>
        <link>${siteUrl}</link>
        <description>RSS Feed for content of ${siteUrl}</description>
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
        <title>${title}</title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${pubDate}</pubDate>
      </item>
    `).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${siteUrl}</title>
        <link>${siteUrl}</link>
        <description>${siteUrl} RSS Feed</description>
        <lastBuildDate>${pubDate}</lastBuildDate>
        ${rssItems}
      </channel>
    </rss>`;

    await fsp.writeFile(filename, rss);
    return true;
  }
  catch (error)
  {
    console.error(error);
    return false;
  }
}