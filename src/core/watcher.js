const { rebuild } = require('./rebuild');
const chokidar = require('chokidar');

async function createWatcher(data, pageFilename, projectDirname, distDirname, port, wss, filenames = undefined)
{
    const watcher = chokidar.watch(projectDirname).on('change', async (filepath) =>
    {
        console.clear();
        console.log(`File ${ filepath } has been changed`);
        console.log("Rebuilding...");
        await rebuild({ data: data, pageFilename: pageFilename, distDirname: distDirname, filenames: filenames }).then(() =>
        {
            wss.clients.forEach((client) =>
            {
                client.send('reload');
            });
        });

        console.log(`Server listening on port ${ port }`);
        console.log(`Check http://localhost:${ port }`);
    })

    return watcher;
}

module.exports = { createWatcher }