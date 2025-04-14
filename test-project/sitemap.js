import { generateProjectSitemapFile } from '../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from './rino-config.js';

async function sitemap ()
{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    await generateProjectSitemapFile(path.resolve(__dirname, "./"), config);
}

sitemap();