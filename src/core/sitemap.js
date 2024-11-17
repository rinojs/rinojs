import fs from 'fs';

export async function generateSitemap(list)
{
    try
    {
        if (!list || list.length == 0) return "";

        let result = `<?xml version='1.0' encoding='UTF-8'?><urlset xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9">`;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${ year }-${ month }-${ day }`;

        for (let link of list)
        {
            result += `<url><loc>${ link }</loc><lastmod>${ formattedDate }</lastmod></url>`;
        }

        result += `</urlset>`;

        return result;
    }
    catch (error)
    {
        console.error(error);
        return "";
    }
}

export async function generateSitemapFile(list, filename)
{
    try
    {
        if (!list || !filename || list.length == 0) return false;

        let result = `<?xml version='1.0' encoding='UTF-8'?><urlset xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9">`;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${ year }-${ month }-${ day }`;

        for (let link of list)
        {
            result += `<url><loc>${ link }</loc><lastmod>${ formattedDate }</lastmod></url>`;
        }

        result += `</urlset>`;

        await fs.promises.writeFile(filename, result);

        return true;
    }
    catch (error)
    {
        console.error(error);
        return false;
    }
}