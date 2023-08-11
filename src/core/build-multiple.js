const { build } = require('./build');

/* 
buildMultiple()
arguments: pages
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
]
*/
async function buildMultiple(pages)
{
    for (let page of pages)
    {
        await build({ data: page.data, pageFilename: page.pageFilename, distDirname: page.distDirname, filenames: page.filenames });
    }

    console.log("Build is completed!");
}

module.exports = { buildMultiple }