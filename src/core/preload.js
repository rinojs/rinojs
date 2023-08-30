const path = require('path');
const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleFromTot } = require('./tot-handler')

/* 
buildPreload()
arguments: args
args: {
    filename: `This is the file path. The directory where the component .tot file is.`,
    data: `json data for injecting to the html, css and javascript`,
}
*/
async function buildPreload(filename, data = null)
{
    const tot = new Tot(path.resolve(filename));

    let css = await tot.getDataByName("css");
    let js = await tot.getDataByName("js");

    if (!js) js = "";
    if (!css) css = "";

    css = await buildSingleFromTot(await buildSingleData(css, data));
    js = await buildSingleFromTot(await buildSingleData(js, data));

    let result = {
        css: css,
        js: js
    };

    return result;
}

module.exports = { buildPreload }