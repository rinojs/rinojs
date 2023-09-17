const chokidar = require('chokidar');

async function createWatcher(src, publicDirname, port, wss, callback)
{
    const watcher = chokidar.watch([src, publicDirname]).on('change', async (filepath) =>
    {
        if (typeof callback == 'function')
        {
            await callback();
        }

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