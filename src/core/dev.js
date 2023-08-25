const { buildMultiple } = require('./build-multiple');
const { findPort } = require('./find-port');
const { createServer } = require('./server');
const { createWSS } = require('./wss');
const { openBrowser } = require('./browser');
const { createWatcher } = require('./watcher');
const { copyAssets } = require('./assets');

/*
dev()
arguments:
{
    pages:[
        {
            pageFilename: `File name for the page, the entry .tot file.`,
            distDirname: `This is the directory where the output files will be stored.`,
            tots: [{name: `name of this`, filename: `File path of .tot file`}, ...],
            mds: [{nname: `name of this`, filename: `File path of .md file`}, ...],
            data: `json data for injecting to the html, css and javascript`,
            filenames: {
                html: `filename for html, default is /index.html`,
                css: `filename for css, default is /style.css`,
                js: `filename for js, default is /main.js`
            }
        }, ... pages continue
    ],
    distRoot: `This is the directory of root where the output files will be stored.`,
    src: `Where your project files are. src directory path. This is for checking changes.`,
    public: `public directory where you store asset files.`
}
*/
async function dev(pages = [{ pageFilename: "", distDirname: "", tots: [{ name: "", filename: "" }], mds: [{ name: "", filename: "" }], data: null, filenames: { html: "", css: "", js: "" } }], distRoot, src, public)
{
    if (pages.length == 0 || !distRoot || !src || !public)
    {
        console.error(`Dev Error: All the arguments are required. Please fill them all.`);
        return false;
    }

    console.log(`Copying assets now...`);
    await copyAssets(public, distRoot);
    console.log(`Copying assets is done...`);

    await buildMultiple(pages);

    let port = await findPort(3000);
    const server = await createServer(distRoot, port);
    const wss = await createWSS(server);
    const url = `http://localhost:${ port }`

    await openBrowser(url);
    await createWatcher(pages, distRoot, src, public, port, wss);
}


module.exports = { dev }