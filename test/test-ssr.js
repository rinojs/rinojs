import { buildSSRComponent } from '../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', async (req, res) =>
{
    const htmlContent = await buildSSRComponent(path.join(__dirname, "./pages/index.html"), path.join(__dirname, "./components/"), path.join(__dirname, "./mds/"));
    res.send(htmlContent);
});

app.listen(port, () =>
{
    console.log(`Server is running at http://localhost:${port}`);
});
