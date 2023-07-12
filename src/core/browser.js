const { exec } = require('child_process');

async function openBrowser(url)
{
    if (process.platform === 'darwin') exec(`open ${ url }`);
    else if (process.platform === 'win32') exec(`start ${ url }`);
    else exec(`xdg-open ${ url }`);
}

module.exports = { openBrowser }