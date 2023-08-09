const path = require('path');
const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleProps } = require('./props');

/* 
buildPreload()
arguments: args
args: {
    dirname: `This is the directory path. The directory where the component .tot file is.`,
    name: `file name of tot file without .tot extension`,
    data: `json data for injecting to the html, css and javascript`,
}
*/
async function buildPreload(args)
{
    const tot = new Tot(path.join(args.dirname, `/${ args.name }.tot`));

    let css = await buildSingleData(await tot.getDataByName("css"), args.data);
    let js = await buildSingleData(await tot.getDataByName("js"), args.data);

    if (!js) js = "";
    if (!css) css = "";

    css = await buildSingleProps(await buildSingleData(css, args.data), args.props);
    js = await buildSingleProps(await buildSingleData(js, args.data), args.props);

    let result = {
        css: css,
        js: js
    };

    return result;
}

module.exports = { buildPreload }