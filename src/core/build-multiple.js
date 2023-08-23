const { build } = require('./build');

/* 
buildMultiple()
argument:
[
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
]
*/
async function buildMultiple(pages)
{
    let size = pages.length;

    console.clear();

    for (let i = 0; i < size; i++)
    {
        await build(pages[i].pageFilename, pages[i].distDirname, pages[i].data, pages[i].filenames);
        console.log(`Building ${ i + 1 }/${ size }`);
    }

    console.log("Build is completed!");
}

module.exports = { buildMultiple }