const fs = require('fs');
const Tot = require('./tot');


module.exports = class Rino
{
    constructor()
    {
    }

    async buildPage(filename, componentsname)
    {
        const tot = new Tot(filename);

        let html = await tot.getDataByName("html");
        let css = await tot.getDataByName("css");;
        let js = await tot.getDataByName("js");;

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

            if (target.substring(0, 11) == "components.")
            {
                let compResult;
                if (target.includes(","))
                {
                    let targetArray = target.split(",");
                    let targetName = targetArray[0].trim().substring(11, target.length);
                    let props = await tot.getDataByName(targetArray[1].trim());
                    compResult = await this.buildComponent(componentsname, targetName, JSON.parse(props));
                }
                else
                {
                    let targetName = target.substring(11, target.length)
                    compResult = await this.buildComponent(componentsname, targetName);
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

    async buildComponent(dirname, name, props = undefined)
    {
        if (dirname[dirname.length - 1] !== '/') dirname = dirname + '/';

        const tot = new Tot(dirname + name + ".tot");

        let html = await tot.getDataByName("html");
        let js = await tot.getDataByName("js");
        let css = await tot.getDataByName("css");

        if (html === undefined || html === null) html = "";
        if (js === undefined || js === null) js = "";
        if (css === undefined || css === null) css = "";

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

            if (target.substring(0, 11) == "components." && !target.includes(name))
            {
                let compResult;
                if (target.includes(","))
                {
                    let targetArray = target.split(",");
                    let targetName = targetArray[0].trim().substring(11, target.length);
                    let prop = await tot.getDataByName(targetArray[1].trim().substring(5));
                    compResult = await this.buildComponent(componentsname, targetName, JSON.parse(prop));
                }
                else
                {
                    let targetName = target.substring(11, target.length)
                    compResult = await this.buildComponent(dirname, targetName);
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


        if (props !== undefined) result = await this.buildProps(result, props);


        return result;
    }

    async buildProps(obj, data)
    {
        obj.html = await this.buildSingleProps(obj.html, data);
        obj.js = await this.buildSingleProps(obj.js, data);
        obj.css = await this.buildSingleProps(obj.css, data);
        return obj;
    }

    async buildSingleProps(text, data)
    {
        let tmp = text;
        let result = "";

        while (tmp.length > 0)
        {
            let start = tmp.indexOf("{{") + 2;
            let end = tmp.indexOf("}}");

            if (start == 1 || end == -1)
            {
                result = result + tmp;
                break;
            }

            result = result + tmp.substring(0, start - 2);
            let target = tmp.substring(start, end).trim();
            tmp = tmp.substring(end + 2);

            if (target.substring(0, 6) == "props.")
            {
                result = result + await this.getValueFromObj(target.substring(6), data)
            }
            else
            {
                result = result + `{{ ${ target } }}`;
            }
        }

        return result;
    }

    async buildData(obj, data)
    {
        obj.html = await this.buildSingleData(obj.html, data);
        obj.js = await this.buildSingleData(obj.js, data);
        obj.css = await this.buildSingleData(obj.css, data);
        return obj;
    }

    async buildSingleData(text, data)
    {
        let tmp = text;
        let result = "";

        while (tmp.length > 0)
        {
            let start = tmp.indexOf("{{") + 2;
            let end = tmp.indexOf("}}");

            if (start == 1 || end == -1)
            {
                result = result + tmp;
                break;
            }

            result = result + tmp.substring(0, start - 2);
            let target = tmp.substring(start, end).trim();
            tmp = tmp.substring(end + 2);

            if (target.substring(0, 5) == "data.")
            {
                result = result + await this.getValueFromObj(target.substring(5), data)
            }
            else
            {
                result = result + `{{ ${ target } }}`;
            }
        }

        return result;
    }

    async writeFiles(dirname, obj)
    {
        if (dirname[dirname.length - 1] !== '/') dirname = dirname + '/';

        await fs.writeFile(`${ dirname }index.html`, obj.html, (error) =>
        {
            if (error)
            {
                console.error(error);
                return false;
            }
        });

        await fs.writeFile(`${ dirname }main.js`, obj.js, (error) =>
        {
            if (error)
            {
                console.error(error);
                return false;
            }
        });

        await fs.writeFile(`${ dirname }style.css`, obj.css, (error) =>
        {
            if (error)
            {
                console.error(error);
                return false;
            }
        });

        console.log(`The files are written in ${ dirname }`);
    }

    async getValueFromObj(target, data)
    {
        return await target.split(".").reduce((obj, prop) => obj[prop], data);
    }
}