import { devStaticSite } from '../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function dev ()
{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    await devStaticSite(path.resolve(__dirname, "./"));
}

dev();