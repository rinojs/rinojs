const path = require('path');
const fs = require('fs');
const Tot = require('totjs');
const chokidar = require('chokidar');
const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');

module.exports = class Rino
{
    constructor()
    {
    }

    async dev(data, pageFilename, projectDirname, distDirname)
    {
        await this.rebuild(data, pageFilename, distDirname);

        const port = 3000;
        const url = `http://localhost:${ port }`
        const server = http.createServer((req, res) =>
        {
            const filePath = path.join(distDirname, req.url);

            fs.readFile(filePath, 'utf8', (error, data) =>
            {
                if (error)
                {
                    fs.readFile(path.join(filePath, 'index.html'), 'utf8', (error, data) =>
                    {
                        if (error)
                        {
                            req.statusCode = 404;
                            res.end('File not found');
                        }
                        else
                        {

                            data = this.injectReload(data)
                            res.end(data);
                        }
                    });
                }
                else
                {
                    data = this.injectReload(data)
                    res.end(data);
                }
            });
        });

        server.listen(port, () =>
        {
            console.log('Server listening on port 3000');
            console.log('Check http://localhost:3000');
        });

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

        if (process.platform === 'darwin') exec(`open ${ url }`);
        else if (process.platform === 'win32') exec(`start ${ url }`);
        else exec(`xdg-open ${ url }`);

        chokidar.watch(projectDirname).on('change', async (filepath) =>
        {
            console.clear();
            console.log(`File ${ filepath } has been changed`);
            console.log("Rebuilding...");
            await this.rebuild(data, pageFilename, distDirname);
            wss.clients.forEach((client) =>
            {
                client.send('reload');
            });
            console.log('Server listening on port 3000');
            console.log('Check http://localhost:3000');
        })
    }

    injectReload(data)
    {
        const reloadScript = `
        <head>
        <script>
            const ws = new WebSocket('ws://localhost:3000');

            ws.onmessage = (event) => {
                console.log(event.data);
                if (event.data === 'reload') {
                    location.reload();
                }
            };
        </script>
        `;
        return data.replace("<head>", reloadScript);
    }

    async rebuild(data, pageFilename, distDirname)
    {
        let page = await this.buildPage(pageFilename);
        page = await this.buildData(page, data);
        await this.writeFiles(distDirname, page);

        console.log("Build is completed!");
    }

    async buildPage(filename)
    {
        const tot = new Tot(filename);

        let html = await tot.getDataByName("html");
        let css = await tot.getDataByName("css");;
        let js = await tot.getDataByName("js");;

        let result = {
            html: "",
            css: css,
            js: js
        };

        while (html.length > 0)
        {
            let start = html.indexOf("{{") + 2;
            let end = html.indexOf("}}");

            if (start == 1 || end == -1)
            {
                result.html = result.html + html;
                break;
            }

            result.html = result.html + html.substring(0, start - 2);
            let target = html.substring(start, end).trim();
            html = html.substring(end + 2);

            if (target.substring(0, 11) == "components.")
            {
                let compResult;
                let targetArray = target.split(",");
                let targetName = targetArray[0].trim().substring(11, target.length);
                let componentDirName = targetArray[1].trim();

                if (targetArray.length > 2)
                {
                    let props;

                    if (targetArray[2] !== undefined) props = JSON.parse(await tot.getDataByName(targetArray[2].trim()))

                    compResult = await this.buildComponent(componentDirName, targetName, props);
                }
                else
                {
                    compResult = await this.buildComponent(componentDirName, targetName);
                }

                result.html = result.html + compResult.html;
                result.css = result.css + compResult.css;
                result.js = result.js + compResult.js;
            }
            else
            {
                result.html = result.html + `{{ ${ target } }}`;
            }
        }

        return result;
    }

    async buildComponent(dirname, name, props = undefined)
    {
        const tot = new Tot(path.join(dirname, `/${ name }.tot`));

        let html = await tot.getDataByName("html");
        let js = await tot.getDataByName("js");
        let css = await tot.getDataByName("css");

        if (html === undefined || html === null) html = "";
        if (js === undefined || js === null) js = "";
        if (css === undefined || css === null) css = "";

        let result = {
            html: "",
            css: css,
            js: js
        };

        while (html.length > 0)
        {
            let start = html.indexOf("{{") + 2;
            let end = html.indexOf("}}");

            if (start == 1 || end == -1)
            {
                result.html = result.html + html;
                break;
            }

            result.html = result.html + html.substring(0, start - 2);
            let target = html.substring(start, end).trim();
            html = html.substring(end + 2);
            let targetArray = target.split(",");
            let targetName = targetArray[0].trim().substring(11, target.length);

            if (target.substring(0, 11) == "components." && !targetName.includes(name))
            {
                let compResult;
                let componentDirName = targetArray[1].trim();

                if (targetArray.length > 2)
                {
                    let props;

                    if (targetArray[2] !== undefined) props = JSON.parse(await tot.getDataByName(targetArray[2].trim()))

                    compResult = await this.buildComponent(componentDirName, targetName, props);
                }
                else
                {
                    compResult = await this.buildComponent(componentDirName, targetName);
                }

                result.html = result.html + compResult.html;
                result.css = result.css + compResult.css;
                result.js = result.js + compResult.js;
            }
            else
            {
                result.html = result.html + `{{ ${ target } }}`;
            }
        }


        if (props !== undefined) result = await this.buildProps(result, props);


        return result;
    }

    async buildProps(obj, data)
    {
        obj.html = await this.buildSingleProps(obj.html, data);
        obj.js = await this.buildSingleProps(obj.js, data);
        obj.css = await this.buildSingleProps(obj.css, data);
        return obj;
    }

    async buildSingleProps(text, data)
    {
        let tmp = text;
        let result = "";

        while (tmp.length > 0)
        {
            let start = tmp.indexOf("{{") + 2;
            let end = tmp.indexOf("}}");

            if (start == 1 || end == -1)
            {
                result = result + tmp;
                break;
            }

            result = result + tmp.substring(0, start - 2);
            let target = tmp.substring(start, end).trim();
            tmp = tmp.substring(end + 2);

            if (target.substring(0, 6) == "props.")
            {
                result = result + await this.getValueFromObj(target.substring(6), data)
            }
            else
            {
                result = result + `{{ ${ target } }}`;
            }
        }

        return result;
    }

    async buildData(obj, data)
    {
        obj.html = await this.buildSingleData(obj.html, data);
        obj.js = await this.buildSingleData(obj.js, data);
        obj.css = await this.buildSingleData(obj.css, data);
        return obj;
    }

    async buildSingleData(text, data)
    {
        let tmp = text;
        let result = "";

        while (tmp.length > 0)
        {
            let start = tmp.indexOf("{{") + 2;
            let end = tmp.indexOf("}}");

            if (start == 1 || end == -1)
            {
                result = result + tmp;
                break;
            }

            result = result + tmp.substring(0, start - 2);
            let target = tmp.substring(start, end).trim();
            tmp = tmp.substring(end + 2);

            if (target.substring(0, 5) == "data.")
            {
                result = result + await this.getValueFromObj(target.substring(5), data)
            }
            else
            {
                result = result + `{{ ${ target } }}`;
            }
        }

        return result;
    }

    async writeFiles(dirname, obj)
    {
        try
        {
            await fs.promises.writeFile(path.join(dirname, "/index.html"), obj.html);
            await fs.promises.writeFile(path.join(dirname, "/main.js"), obj.js);
            await fs.promises.writeFile(path.join(dirname, "/style.css"), obj.css);
            return true;
        }
        catch (error)
        {
            console.error(`You may need to manually create a new directory at ${ dirname }`);
            console.error(error);
            return false;
        }
    }

    async getValueFromObj(target, data)
    {
        return await target.split(".").reduce((obj, prop) => obj[prop], data);
    }
}