const { build } = require('./build');

/* 
buildMultiple()
argument:
[
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
]
*/
async function buildMultiple(pages = [{ pageFilename: "", distDirname: "", tots: [{ name: "", filename: "" }], mds: [{ name: "", filename: "" }], data: null, filenames: { html: "", css: "", js: "" } }])
{
    let size = pages.length;

    for (let i = 0; i < size; i++)
    {
        await build(pages[i].pageFilename, pages[i].distDirname, pages[i].tots, pages[i].mds, pages[i].data, pages[i].filenames);
        console.log(`Building ${ i + 1 }/${ size } pages`);
    }

    console.log("Build is completed!");
}

module.exports = { buildMultiple }