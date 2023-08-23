const { buildMultiple } = require('./build-multiple');
const chokidar = require('chokidar');

async function createWatcher(pages, projectDirname, port, wss)
{
    const watcher = chokidar.watch(projectDirname).on('change', async (filepath) =>
    {

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