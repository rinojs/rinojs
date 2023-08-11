const path = require('path');
const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleProps } = require('./props');
const { getValueFromObj } = require('./value-getter');
const { buildComponent } = require('./component');
const { buildPreload } = require('./preload');

/* 
buildPComponent()
arguments: args
args: {
    filename: `This is the file path of tot file.`,
    data: `json data for injecting to the html, css and javascript`,
    props: properties that is passed from the parent.
}
*/
async function buildPComponent(args)
{
    const tot = new Tot(path.resolve(args.filename));

    let html = await tot.getDataByName("html");
    let css = await buildSingleData(await tot.getDataByName("css"), args.data);
    let js = await buildSingleData(await tot.getDataByName("js"), args.data);


    if (!html) html = "";
    if (!js) js = "";
    if (!css) css = "";

    css = await buildSingleProps(await buildSingleData(css, args.data), args.props);
    js = await buildSingleProps(await buildSingleData(js, args.data), args.props);

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

        if (target.substring(0, 6) == "@data." && args.data)
        {
            result.html = result.html + await getValueFromObj(target.substring(6), args.data)
        }
        else if (target.substring(0, 7) == "@props." && args.props)
        {
            result.html = result.html + await getValueFromObj(target.substring(7), args.props);
        }
        else if (target.substring(0, 8) == "@preload")
        {
            let preloadResult;
            let targetArray = target.split(",");
            let preloadFileName = targetArray[1].trim();

            preloadResult = await buildPreload({ filename: preloadFileName, data: args.data });

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

                compResult = await buildComponent({ filename: componentFilename, data: args.data, props: props, htmlName: htmlName });
            }
            else
            {
                compResult = await buildComponent({ filename: componentFilename, data: args.data, htmlName: htmlName });
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

                compResult = await buildPComponent({ filename: componentFilename, data: args.data, props: props });
            }
            else
            {
                compResult = await buildPComponent({ filename: componentFilename, data: args.data });
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