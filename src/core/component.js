const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { getValueFromObj } = require('./value-getter');
const { buildPreload } = require('./preload');
const { getDataFromTot, buildSingleFromTot } = require('./tot-handler')
const { loadMD } = require('./obj-handler');

/* 
buildComponent()
arguments:
{
    filename: `This is the file path of tot file.`,
    data: `js object, json data for injecting to the html, css and javascript`,
}
*/
async function buildComponent(filename, data = null)
{
    const tot = new Tot(filename);

    let html = await tot.getDataByName("html");
    let css = await tot.getDataByName("css");
    let js = await tot.getDataByName("js");

    if (!html) html = "";
    if (!js) js = "";
    if (!css) css = "";

    css = await buildSingleFromTot(await buildSingleData(css, data));
    js = await buildSingleFromTot(await buildSingleData(js, data));

    let result = {
        html: "",
        css: css,
        js: js,
        prelaodJS: "",
        preloadCSS: ""
    };

    while (html.length > 0)
    {
        let start = html.indexOf("{{") + 2;
        let end = html.indexOf("}}", start);

        if (start == 1 || end == -1)
        {
            result.html = result.html + html;
            break;
        }

        result.html = result.html + html.substring(0, start - 2);
        let target = html.substring(start, end).trim();
        html = html.substring(end + 2);

        if (target.substring(0, 3) == "@md")
        {
            let targetArray = target.split(",");
            result.html = result.html + await loadMD(targetArray[1].trim());
        }
        else if (target.substring(0, 5) == "@tot.")
        {
            let targetArray = target.split(",");
            result.html = result.html + await getDataFromTot(targetArray[0].substring(5), targetArray[1].trim());
        }
        else if (target.substring(0, 6) == "@data." && data)
        {
            result.html = result.html + await getValueFromObj(target.substring(6), data)
        }
        else if (target.substring(0, 8) == "@preload")
        {
            let preloadResult;
            let targetArray = target.split(",");
            let preloadFileName = targetArray[1].trim();

            preloadResult = await buildPreload(preloadFileName, data);

            result.prelaodJS = result.prelaodJS + preloadResult.js;
            result.preloadCSS = result.preloadCSS + preloadResult.css;
        }
        else if (target.substring(0, 10) == "@component")
        {
            let targetArray = target.split(",");
            let componentFilename = targetArray[1].trim();
            let compResult = await buildComponent(componentFilename, data);

            if (compResult.prelaodJS) result.prelaodJS = result.prelaodJS + compResult.prelaodJS;
            if (compResult.preloadCSS) result.preloadCSS = result.preloadCSS + compResult.preloadCSS;

            result.html = result.html + compResult.html;
            result.css = result.css + compResult.css;
            result.js = result.js + compResult.js;
        }
        else
        {
            result.html = result.html + `{{ ${ target } }}`;
        }
    }

    return result;
}

module.exports = { buildComponent }