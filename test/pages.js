const path = require('path');

async function pages()
{
    return [
        {
            data: {
                title: 'Test Title',
                testid: 'test',
            },
            tots: [
                {
                    name: 'test',
                    filename: './tot/data.tot'
                }
            ],
            mds: [
                {
                    name: 'test',
                    filename: './md/test.md'
                }
            ],
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