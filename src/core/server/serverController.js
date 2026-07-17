export function createServerController({ port, server, watcher, wss })
{
    return {
        port,
        server,
        watcher,
        wss,
        async close()
        {
            if (watcher)
            {
                await watcher.close();
            }

            if (wss)
            {
                wss.close();
            }

            if (server)
            {
                await new Promise((resolve, reject) =>
                {
                    server.close((error) => error ? reject(error) : resolve());
                });
            }
        }
    };
}
