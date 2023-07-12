const path = require('path');
const fs = require('fs');
const express = require("express");
const cors = require('cors');
const http = require('http');
const { injectReload } = require('./inject-reload.js');

async function createServer(distDirname, port)
{
    const app = express();
    app.use(cors({
        origin: ['http://localhost'],
        methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Authorization'],
        maxAge: 86400,
    }))

    app.use(async (req, res, next) =>
    {
        let filePath = path.join(distDirname, req.url);

        await fs.readFile(filePath, 'utf8', async (error, data) =>
        {
            if (error)
            {
                filePath = path.join(filePath, 'index.html');

                await fs.readFile(filePath, 'utf8', async (error, data) =>
                {
                    if (error)
                    {
                        next();
                    }
                    else
                    {
                        data = await injectReload(data, port)
                        res.send(data);
                    }
                });
            }
            else
            {
                let fileext = path.extname(filePath);
                if (fileext === '.html')
                {
                    data = await injectReload(data, port)
                    res.send(data);
                }
                else
                {
                    next();
                }
            }
        })
    })

    app.use(express.static(distDirname));

    const server = http.createServer(app);

    server.listen(port, () =>
    {
        console.log(`Server listening on port ${ port }`);
        console.log(`Development: http://localhost:${ port }`);
    });
    return server;
}


module.exports = { createServer }