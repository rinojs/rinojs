const { buildPage } = require('./page');
const { writeFiles } = require('./write-files');
const Tot = require('totjs');
/* 
build()
arguments: args
args: {
    pageFilename: `File name for the page, strting .tot file.`,
    data: `js object, json data for injecting to the html, css and javascript`,
    totFilename: `File path of .tot that contains data.`,
    distDirname: `This is the directory where the output files will be stored.`,
    filenames: {
        html: `filename for html, default is /index.html`,
        css: `filename for css, default is /style.css`,
        js: `filename for js, default is /main.js`
    }
}
*/
async function build(pageFilename, distDirname, data = null, filenames = { html: "", css: "", js: "" })
{
    let page = await buildPage(pageFilename, data);

    await writeFiles(distDirname, page, filenames);
}

module.exports = { build }