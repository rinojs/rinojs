const path = require('path');
const fs = require('fs');

/*
writeFiles()
arguments:
dirname: `This is the directory where the output files will be stored.`,
obj: {
    html: `html content`,
    css: `css content`,
    js: `js content`
},
filenames: {
    html: `filename for html, default is /index.html`,
    css: `filename for css, default is /style.css`,
    js: `filename for js, default is /main.js`
}
*/
async function writeFiles(dirname, obj, filenames = undefined)
{
    try
    {
        if (!fs.existsSync(dirname))
        {
            await fs.promises.mkdir(dirname);
        }

        if (!filenames) 
        {
            filenames = {
                html: "/index.html",
                js: "/main.js",
                css: "/style.css"
            };
        }
        else
        {
            if (!filenames.html) filenames.html = "/index.html";
            if (!filenames.css) filenames.css = "/main.js";
            if (!filenames.js) filenames.js = "/style.css";
        }

        await fs.promises.writeFile(path.join(dirname, filenames.html), obj.html);
        await fs.promises.writeFile(path.join(dirname, filenames.js), obj.js);
        await fs.promises.writeFile(path.join(dirname, filenames.css), obj.css);
        return true;
    }
    catch (error)
    {
        console.error(error);
        return false;
    }
}

module.exports = { writeFiles }