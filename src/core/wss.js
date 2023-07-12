const WebSocket = require('ws');

async function createWSS(server)
{
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) =>
    {
        ws.on('message', (message) =>
        {
            if (message === 'reload')
            {
                wss.clients.forEach((client) =>
                {
                    client.send('reload');
                });
            }
        });
    });

    return wss;
}

module.exports = { createWSS }