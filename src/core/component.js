const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleProps } = require('./props');
const { replaceEvents } = require('./syntax-handler');
const { buildSingleFromTot } = require('./tot-handler')

/* 
buildComponent()
arguments: {
    filename: `This is the file path of tot file.`,
    htmlName: `Name of the variable for html content.`,
    data: `json data for injecting to the html, css and javascript`,
    props: `properties that is passed from the parent.`
}
*/
async function buildComponent(filename, htmlName, data = null, props = null)
{
    try
    {
        const tot = new Tot(filename);

        let html = await tot.getDataByName("html");
        let css = await tot.getDataByName("css");
        let js = await tot.getDataByName("js");

        if (!html) throw new Error("Need html to build a component");
        if (!js) js = "";
        if (!css) css = "";

        html = await replaceEvents(await buildSingleFromTot(await buildSingleProps(await buildSingleData(html, data), props)));
        css = await buildSingleFromTot(await buildSingleProps(await buildSingleData(css, data), props));
        js = await buildSingleFromTot(await buildSingleProps(await buildSingleData(js, data), props));

        html = "var " + htmlName + " = `" + html.replaceAll("`", "\`") + "`;\n" + htmlName + ";\n";
        js = html + js;

        return { js: js, css: css };
    }
    catch (error)
    {
        console.error(error);
    }
}

module.exports = { buildComponent }