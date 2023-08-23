const path = require('path');
const Rino = require('../src/index.js');

async function pages()
{
    const rino = new Rino();

    return [
        {
            data: {
                title: 'Test Title',
                testid: 'test',
                test: await rino.loadTot("./tot/data.tot")
            },
            pageFilename: path.resolve(__dirname, "./page/index.tot"),
            distDirname: path.resolve(__dirname, "../testdist"),
            filenames: {
                css: "style.css",
                js: "main.js"
            }
        },
        {
            data: {
                title: 'Page2!',
            },
            pageFilename: path.resolve(__dirname, "./page/page2.tot"),
            distDirname: path.resolve(__dirname, "../testdist"),
            filenames: {
                html: "page2.html",
                css: "page2-style.css",
                js: "page2-main.js"
            }
        }
    ];
}

module.exports = { pages }