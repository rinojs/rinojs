const { buildMultiple } = require('./build-multiple');
const { findPort } = require('./find-port');
const { createServer } = require('./server');
const { createWSS } = require('./wss');
const { openBrowser } = require('./browser');
const { createWatcher } = require('./watcher');

/* 
dev()
arguments:
{
    pages:[
        {
            data: `json data for injecting to the html, css and javascript`,
            pageFilename: `File name for the page, strting .tot file.`,
            distDirname: `This is the directory where the output files will be stored.`,
            filenames: {
                html: `filename for html, default is /index.html`,
                css: `filename for css, default is /style.css`,
                js: `filename for js, default is /main.js`
            }
        }, ... pages continue
    ],
    root: `This is the directory of root where the output files will be stored.`,
    projectDirname: `Where your project files are. src directory path. This is for checking changes.`
}
*/
async function dev(pages = [{ data: null, pageFilename: "", filenames: { html: "", css: "", js: "" } }], root, projectDirname)
{
    await buildMultiple(pages);

    let port = await findPort(3000);
    const server = await createServer(root, port);
    const wss = await createWSS(server);
    const url = `http://localhost:${ port }`

    await openBrowser(url);
    await createWatcher(pages, projectDirname, port, wss);
}


module.exports = { dev }