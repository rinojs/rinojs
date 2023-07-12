const path = require('path');
const Tot = require('totjs');
const { buildSingleData } = require('./data-handler');
const { buildSingleProps } = require('./props');
const { getValueFromObj } = require('./value-getter');
const { buildComponent } = require('./component');

/* 
buildPComponent()
arguments: args
args: {
    dirname: `This is the directory path. The directory where the component .tot file is.`,
    name: `file name of tot file without .tot extension`,
    data: `json data for injecting to the html, css and javascript`,
}
*/
async function buildPComponent(args)
{
    const tot = new Tot(path.join(args.dirname, `/${ args.name }.tot`));

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
        js: js
    };

    while (html.length > 0)
    {
        let start = html.indexOf("{{") + 2;
        let end = html.indexOf("}}");

        if (start == 1 || end == -1)
        {
            result.html = result.html + html;
            break;
        }

        result.html = result.html + html.substring(0, start - 2);
        let target = html.substring(start, end).trim();
        html = html.substring(end + 2);
        let targetArray = target.split(",");
        let targetName = targetArray[0].trim().substring(12, target.length);

        if (target.substring(0, 6) == "@data." && args.data)
        {
            result.html = result.html + await getValueFromObj(target.substring(6), args.data)
        }
        else if (target.substring(0, 7) == "@props." && args.props)
        {
            result.html = result.html + await getValueFromObj(target.substring(7), args.props);
        }
        else if (target.substring(0, 10) == "component.")
        {
            let compResult;
            let targetArray = target.split(",");
            let targetName = targetArray[0].trim().substring(10, target.length);
            let componentDirName = targetArray[1].trim();
            let htmlName = targetArray[2].trim();

            if (targetArray.length > 3)
            {
                let props;

                if (targetArray[3]) props = JSON.parse(await tot.getDataByName(targetArray[3].trim()))

                compResult = await buildComponent({ dirname: componentDirName, name: targetName, data: args.data, props: props, htmlName: htmlName });
            }
            else
            {
                compResult = await buildComponent({ dirname: componentDirName, name: targetName, data: args.data, htmlName: htmlName });
            }

            result.css = result.css + compResult.css;
            result.js = compResult.js + result.js;
        }
        else if (target.substring(0, 11) == "@component." && targetName !== args.name)
        {
            let compResult;
            let targetArray = target.split(",");
            let targetName = targetArray[0].trim().substring(11, target.length);
            let componentDirName = targetArray[1].trim();

            if (targetArray.length > 2)
            {
                let props;

                if (targetArray[2]) props = JSON.parse(await tot.getDataByName(targetArray[2].trim()))

                compResult = await buildPComponent({ dirname: componentDirName, name: targetName, data: args.data, props: props });
            }
            else
            {
                compResult = await buildPComponent({ dirname: componentDirName, name: targetName, data: args.data });
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

    return result;
}

module.exports = { buildPComponent }