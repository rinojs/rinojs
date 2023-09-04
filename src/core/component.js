const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleProps } = require('./props');
const { getValueFromObj, getValueFromList } = require('./value-getter');
const { buildPreload } = require('./preload');
const { getDataFromTot, buildSingleFromTot } = require('./tot-handler')
const { loadMD } = require('./obj-handler');

/* 
buildComponent()
arguments:
{
    filename: `This is the file path of tot file.`,
    data: `js object, json data for injecting to the html, css and javascript`,
    props: properties that is passed from the parent. List.
}
*/
async function buildComponent(filename, data = null, props = [])
{
    if (!filename)
    {
        console.error("Fillname is empty.");

        return {
            html: "",
            css: "",
            js: "",
            prelaodJS: "",
            preloadCSS: ""
        }
    }

    const tot = new Tot(filename);

    let html = await tot.getDataByName("html");
    let css = await tot.getDataByName("css");
    let js = await tot.getDataByName("js");

    if (!html) html = "";
    if (!js) js = "";
    if (!css) css = "";
    if (css) css = await buildSingleFromTot(await buildSingleProps(await buildSingleData(css, data), props));
    if (js) js = await buildSingleFromTot(await buildSingleProps(await buildSingleData(js, data), props));

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
        else if (target.substring(0, 6) == "@props" && props)
        {
            html = html + await getValueFromList(target.substring(6), props);
        }
        else
        {
            html = html + `{{ ${ target } }}`;
        }
    }

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
        target = html.substring(start, end).trim();
        html = html.substring(end + 2);

        if (target.substring(0, 3) == "@md")
        {
            targetArray = target.split(",");
            result.html = result.html + await loadMD(targetArray[1].trim());
        }
        else if (target.substring(0, 8) == "@preload")
        {
            let preloadResult;
            targetArray = target.split(",");
            let preloadFileName = targetArray[1].trim();

            preloadResult = await buildPreload(preloadFileName, data);

            result.prelaodJS = result.prelaodJS + preloadResult.js;
            result.preloadCSS = result.preloadCSS + preloadResult.css;
        }
        else if (target.substring(0, 10) == "@component")
        {
            let compResult =
            {
                html: "",
                css: "",
                js: "",
                prelaodJS: "",
                preloadCSS: ""
            };
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