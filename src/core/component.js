const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleProps } = require('./props');
const { buildPreload } = require('./preload');
const { buildSingleFromTot } = require('./tot-handler')
const { loadMD } = require('./obj-handler');
const { buildInnerData } = require('./inner-data');
const { removeComments } = require('./comment');
const { getValueFromObj } = require('./value-getter');
const {
    buildTemplateData,
    listComponentSyntax,
    findEnd
} = require('./parse-util');

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
    if (css) css = await removeComments(await buildSingleFromTot(await buildSingleProps(await buildSingleData(css, data), props)));
    if (js) js = await removeComments(await buildSingleFromTot(await buildSingleProps(await buildSingleData(js, data), props)));

    html = await buildTemplateData(html, data, props);
    let start = 0;
    let end = 0;
    let target = "";
    let targetArray = "";
    let result = {
        html: "",
        css: css,
        js: js,
        prelaodJS: "",
        preloadCSS: ""
    };

    while (html.length > 0)
    {
        start = html.indexOf("{{") + 2;
        end = await findEnd(html, start);

        if (start == 1 || end == -1)
        {
            result.html = result.html + html;
            break;
        }

        result.html = result.html + html.substring(0, start - 2);
        target = html.substring(start, end).trim();
        html = html.substring(end + 2);
        target = await buildInnerData(target, data, props);

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
            targetArray = await listComponentSyntax(target);
            let componentFilename = targetArray[1].trim();

            if (targetArray.length > 2)
            {
                let newProps = [];

                for (let i = 2; i < targetArray.length; i++) 
                {
                    let prop = targetArray[i].trim();

                    if (prop.startsWith("(") && prop.endsWith(")"))
                    {
                        newProps.push(prop.substring(1, prop.length - 1));
                    }
                    else
                    {
                        let tempProp = await tot.getDataByName(prop);
                        newProps.push(tempProp);
                    }
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