import { WebSocketServer } from 'ws';

export async function createWSS(server)
{
    const wss = new WebSocketServer({ server });

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