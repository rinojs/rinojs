const Tot = require('totjs');
const { buildComponent } = require('./component');
const { replaceEvents } = require('./event-syntax');
const { buildSingleData } = require('./data-handler');
const { getValueFromObj } = require('./value-getter');
const { bundlejs } = require('./bundle');
const { buildPreload } = require('./preload');
const { getDataFromTot, buildSingleFromTot } = require('./tot-handler')
const { loadMD } = require('./obj-handler');

/* 
buildPage()
arguments: args
args: {
    filename: `File name for the page, strting .tot file path.`,
    data: `js object, json data for injecting to the html, css and javascript`
}
*/
async function buildPage(filename, data = null)
{
    const tot = new Tot(filename);

    let html = await tot.getDataByName("html");
    let css = await tot.getDataByName("css");
    let js = await tot.getDataByName("js");

    if (!html) html = "";
    if (!js) js = "";
    if (!css) css = "";
    if (css) css = await buildSingleFromTot(await buildSingleData(css, data));
    if (js) js = await buildSingleFromTot(await buildSingleData(js, data));

    let tempHTML = html;
    html = "";
    let start = 0;
    let end = 0;
    let target = "";
    let targetArray = "";

    while (tempHTML.length > 0)
    {
        start = tempHTML.indexOf("{{") + 2;
        end = tempHTML.indexOf("}}", start);

        if (start == 1 || end == -1)
        {
            html = html + tempHTML;
            break;
        }

        html = html + tempHTML.substring(0, start - 2);
        target = tempHTML.substring(start, end).trim();
        tempHTML = tempHTML.substring(end + 2);

        if (target.substring(0, 5) == "@tot.")
        {
            targetArray = target.split(",");
            html = html + await getDataFromTot(targetArray[0].substring(5), targetArray[1].trim());
        }
        else if (target.substring(0, 6) == "@data." && data)
        {
            html = html + await getValueFromObj(target.substring(6), data)
        }
        else
        {
            html = html + `{{ ${ target } }}`;
        }
    }

    let result = {
        html: "",
        css: css,
        js: js
    };

    while (html.length > 0)
    {
        start = html.indexOf("{{") + 2;
        end = html.indexOf("}}", start);

        if (start == 1 || end == -1)
        {
            result.html = result.html + html;
            break;
        }

        result.html = result.html + html.substring(0, start - 2);
        target = html.substring(start, end).trim();
        html = html.substring(end + 2);

        if (target.substring(0, 3) == "@md")
        {
            targetArray = target.split(",");
            result.html = result.html + await loadMD(targetArray[1].trim());
        }
        else if (target.substring(0, 8) == "@preload")
        {
            targetArray = target.split(",");
            let preloadFileName = targetArray[1].trim();
            let preloadResult = await buildPreload(preloadFileName, data);

            if (result.js.includes(`//rino.js js preload marker`)) result.js = result.js.replace(`//rino.js js preload marker`, preloadResult.js + `\n//rino.js js preload marker\n`);
            else result.js = `${ preloadResult.js }\n//rino.js js preload marker\n${ result.js }`;
            if (result.css.includes(`/* rino.js css preload marker */`)) result.css = result.css.replace(`/* rino.js css preload marker */`, preloadResult.css + `\n/* rino.js css preload marker */\n`);
            else result.css = `${ preloadResult.css }\n/* rino.js css preload marker */\n${ result.css }`;
        }
        else if (target.substring(0, 10) == "@component")
        {
            let compResult = null;
            targetArray = target.split(",");
            let componentFilename = targetArray[1].trim();

            if (targetArray.length > 2)
            {
                let newProps = [];

                for (let i = 2; i < targetArray.length; i++) 
                {
                    let propName = targetArray[i].trim();
                    let tempProp = await tot.getDataByName(propName);
                    newProps.push(tempProp);
                }

                compResult = await buildComponent(componentFilename, data, newProps);
            }
            else
            {
                compResult = await buildComponent(componentFilename, data);
            }

            if (compResult.prelaodJS)
            {
                if (result.js.includes(`//rino.js js preload marker`)) result.js = result.js.replace(`//rino.js js preload marker`, compResult.prelaodJS + `\n//rino.js js preload marker\n`);
                else result.js = `${ compResult.prelaodJS }\n//rino.js js preload marker\n${ result.js }`;
            }

            if (compResult.preloadCSS)
            {
                if (result.css.includes(`/* rino.js css preload marker */`)) result.css = result.css.replace(`/* rino.js css preload marker */`, compResult.preloadCSS + `\n/* rino.js css preload marker */\n`);
                else result.css = `${ compResult.preloadCSS }\n/* rino.js css preload marker */\n${ result.css }`;
            }

            result.html = result.html + compResult.html;
            result.css = result.css + compResult.css;
            result.js = result.js + compResult.js;
        }
        else
        {
            result.html = result.html + `{{ ${ target } }}`;
        }
    }

    if (result.js.includes(`//rino.js js preload marker`)) result.js = result.js.replace(`//rino.js js preload marker`, ``);
    if (result.css.includes(`/* rino.js css preload marker */`)) result.css = result.css.replace(`/* rino.js css preload marker */`, ``);

    result.html = await replaceEvents(result.html);
    result.js = await bundlejs(result.js);
    return result;
}

module.exports = { buildPage }