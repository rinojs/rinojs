const { buildMultiple } = require('./build-multiple');
const chokidar = require('chokidar');
const { copyAssets } = require('./assets');

async function createWatcher(pages, distRoot, src, publicDirname, port, wss)
{
    const watcher = chokidar.watch([src, publicDirname]).on('change', async (filepath) =>
    {
        console.clear();
        console.log(`Copying assets now...`);
        await copyAssets(publicDirname, distRoot);
        console.log(`Copying assets is done...`);

        await buildMultiple(pages);

        console.log(`File ${ filepath } has been changed`);
        console.log("Rebuilding...");

        wss.clients.forEach((client) =>
        {
            client.send('reload');
        });

        console.log(`Server listening on port ${ port }`);
        console.log(`Check http://localhost:${ port }`);
    })

    return watcher;
}

module.exports = { createWatcher }