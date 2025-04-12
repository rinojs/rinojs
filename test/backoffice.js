import { startBackofficeServer } from '../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function backoffice ()
{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    await startBackofficeServer(path.resolve(__dirname, "./"));
}

backoffice();