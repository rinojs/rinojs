const { rebuild } = require('./rebuild');
const { findPort } = require('./find-port');
const { createServer } = require('./server');
const { createWSS } = require('./wss');
const { openBrowser } = require('./browser');
const { createWatcher } = require('./watcher');

/* 
dev()
arguments: args
args: {
    data: `json data for injecting to the html, css and javascript`,
    pageFilename: `File name for the page, strting .tot file.`,
    projectDirname: `Where your project files are. src directory path. This is for checking changes.`
    distDirname: `This is the directory where the output files will be stored.`,
    filenames: {
        html: `filename for html, default is /index.html`,
        css: `filename for css, default is /style.css`,
        js: `filename for js, default is /main.js`
    }
}
*/
async function dev(args)
{
    await rebuild({ data: args.data, pageFilename: args.pageFilename, distDirname: args.distDirname, filenames: args.filenames });

    let port = await findPort(3000);
    const server = await createServer(args.distDirname, port);
    const wss = await createWSS(server);
    const url = `http://localhost:${ port }`

    await openBrowser(url);
    await createWatcher(args.data, args.pageFilename, args.projectDirname, args.distDirname, port, wss, args.filenames);
}





module.exports = { dev }