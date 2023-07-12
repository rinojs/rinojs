
const net = require('net');

async function findPort(port)
{
    let result = await isPortInUse(port)

    if (result)
    {
        return await findPort(port + 1);
    }
    else
    {
        return port;
    }
}

function isPortInUse(port)
{
    return new Promise((resolve, reject) =>
    {
        const server = net.createServer()
            .once('error', error =>
            {
                if (error.code !== 'EADDRINUSE') return reject(error);
                resolve(true);
            })
            .once('listening', () =>
            {
                server.close();
                resolve(false);
            })
            .listen(port);
    });
}

module.exports = { findPort, isPortInUse }