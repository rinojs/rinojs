import { buildStaticSite } from '../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function generate ()
{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    await buildStaticSite(path.resolve(__dirname, "./"));
}

generate();