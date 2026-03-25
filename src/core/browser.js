import { exec } from 'child_process';

export async function openBrowser(url)
{
    const command = process.platform === 'darwin'
        ? `open "${ url }"`
        : process.platform === 'win32'
            ? `start "" "${ url }"`
            : `xdg-open "${ url }"`;

    try
    {
        exec(command, (error) =>
        {
            if (error)
            {
                console.warn(`Failed to open browser automatically: ${ error.message }`);
            }
        });
    }
    catch (error)
    {
        console.warn(`Failed to open browser automatically: ${ error.message }`);
    }
}
