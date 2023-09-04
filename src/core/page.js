const Tot = require('totjs');
const { buildComponent } = require('./component');
const { replaceEvents } = require('./event-syntax');
const { buildSingleData } = require('./data-handler');
const { bundlejs } = require('./bundle');
const { buildPreload } = require('./preload');
const { buildSingleFromTot } = require('./tot-handler')
const { loadMD } = require('./obj-handler');
const { buildInnerData } = require('./inner-data');
const { buildTemplateData } = require('./pc-helper');
const { removeComments } = require('./comment');
const CleanCSS = require('clean-css');
const { getValueFromObj } = require('./value-getter');


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
    if (css) css = await removeComments(await buildSingleFromTot(await buildSingleData(css, data)));
    if (js) js = await removeComments(await buildSingleFromTot(await buildSingleData(js, data)));

    html = await buildTemplateData(html, data);
    let start = 0;
    let end = 0;
    let target = "";
    let targetArray = "";
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
        target = await buildInnerData(target, data);

        if (target.substring(0, 2) == "//")
        {
            continue;
        }
        else if (target.substring(0, 3) == "@md")
        {
            targetArray = target.split(",");
            result.html = result.html + await loadMD(targetArray[1].trim());
        }
        else if (target.substring(0, 6) == "@data." && data)
        {
            if (target.substring(5, 9) == ".md.") result.html = result.html + await getValueFromObj(target.substring(6), data);
            else result.html = result.html + `{{ ${ target } }}`;
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
    const cleancss = new CleanCSS({});
    result.css = await cleancss.minify(result.css).styles;

    return result;
}

module.exports = { buildPage }