const { buildPage } = require('./page');
const { writeFiles } = require('./write-files');
const { loadTot, loadMD } = require('./obj-handler');

/* 
build()
arguments: args
args: {
    pageFilename: `File name for the page, the entry .tot file.`,
    distDirname: `This is the directory where the output files will be stored.`,
    tots: [{name: `name of this`, filename: `File path of .tot file`}, ...],
    mds: [{nname: `name of this`, filename: `File path of .md file`}, ...],
    data: `js object, json data for injecting to the html, css and javascript`,
    filenames: {
        html: `filename for html, default is /index.html`,
        css: `filename for css, default is /style.css`,
        js: `filename for js, default is /main.js`
    }
}
*/
async function build(pageFilename, distDirname, tots = [{ name: "", filename: "" }], mds = [{ name: "", filename: "" }], data = null, filenames = { html: "", css: "", js: "" })
{
    if (!data) data = {};
    if (!data.tot) data.tot = {};
    if (!data.md) data.md = {};
    if (!tots[0].name || !tots[0].filename) tots = [];
    if (!mds[0].name || !mds[0].filename) mds = [];

    if (tots.length > 0)
    {
        for (let tot of tots) data.tot[tot.name] = await loadTot(tot.filename);
    }
    else data.tot = null;

    if (mds.length > 0)
    {
        for (let md of mds) data.md[md.name] = await loadMD(md.filename);
    }
    else data.md = null;

    let page = await buildPage(pageFilename, data);

    await writeFiles(distDirname, page, filenames);
}

module.exports = { build }