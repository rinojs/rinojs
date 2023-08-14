const { buildPage } = require('./page');
const { writeFiles } = require('./write-files');

/* 
build()
arguments: args
args: {
    data: `json data for injecting to the html, css and javascript`,
    pageFilename: `File name for the page, strting .tot file.`,
    distDirname: `This is the directory where the output files will be stored.`,
    filenames: {
        html: `filename for html, default is /index.html`,
        css: `filename for css, default is /style.css`,
        js: `filename for js, default is /main.js`
    }
}
*/
async function build(args)
{
    let page = await buildPage({ filename: args.pageFilename, data: args.data });

    await writeFiles(args.distDirname, page, args.filenames);
}

module.exports = { build }