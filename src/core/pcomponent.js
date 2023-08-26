const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleProps } = require('./props');
const { getValueFromObj } = require('./value-getter');
const { buildComponent } = require('./component');
const { buildPreload } = require('./preload');
const { getDataFromTot, buildSingleFromTot } = require('./tot-handler')
const { loadMD } = require('./obj-handler');

/* 
buildPComponent()
arguments:
{
    filename: `This is the file path of tot file.`,
    data: `js object, json data for injecting to the html, css and javascript`,
    props: properties that is passed from the parent.
}
*/
async function buildPComponent(filename, data = null, props = null)
{
    const tot = new Tot(filename);

    let html = await tot.getDataByName("html");
    let css = await tot.getDataByName("css");
    let js = await tot.getDataByName("js");

    if (!html) html = "";
    if (!js) js = "";
    if (!css) css = "";

    css = await buildSingleFromTot(await buildSingleProps(await buildSingleData(css, data), props));
    js = await buildSingleFromTot(await buildSingleProps(await buildSingleData(js, data), props));

    let result = {
        html: "",
        css: css,
        js: js,
        prelaodJS: "",
        preloadCSS: "",
        componentJS: "",
        componentCSS: ""
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
        else if (target.substring(0, 7) == "@props." && props)
        {
            result.html = result.html + await getValueFromObj(target.substring(7), props);
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
        else if (target.substring(0, 9) == "component")
        {
            let compResult;
            let targetArray = target.split(",");
            let componentFilename = targetArray[1].trim();
            let htmlName = targetArray[2].trim();

            if (targetArray.length > 3)
            {
                let props;

                if (targetArray[3]) props = JSON.parse(await tot.getDataByName(targetArray[3].trim()))

                compResult = await buildComponent(componentFilename, htmlName, data, props);
            }
            else
            {
                compResult = await buildComponent(componentFilename, htmlName, data);
            }

            result.componentJS = result.componentJS + compResult.js;
            result.componentCSS = result.componentCSS + compResult.css;
        }
        else if (target.substring(0, 10) == "@component")
        {
            let compResult;
            let targetArray = target.split(",");
            let componentFilename = targetArray[1].trim();

            if (targetArray.length > 2)
            {
                let props;

                if (targetArray[2]) props = JSON.parse(await tot.getDataByName(targetArray[2].trim()))

                compResult = await buildPComponent(componentFilename, data, props);
            }
            else
            {
                compResult = await buildPComponent(componentFilename, data);
            }

            if (compResult.prelaodJS) result.prelaodJS = result.prelaodJS + compResult.prelaodJS;
            if (compResult.preloadCSS) result.preloadCSS = result.preloadCSS + compResult.preloadCSS;
            if (compResult.componentJS) result.componentJS = result.componentJS + compResult.componentJS;
            if (compResult.componentCSS) result.componentCSS = result.componentCSS + compResult.componentCSS;

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

module.exports = { buildPComponent }