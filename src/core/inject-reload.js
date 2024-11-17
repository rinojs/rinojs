export async function injectReload(page, port)
{
    const reloadScript = `
        <script type="text/javascript">
            const rinows = new WebSocket('ws://localhost:${ port }');

            rinows.onmessage = (event) => {
                if (event.data === 'reload') {
                    location.reload();
                }
            };
        </script>
        </head>
        `;
    return page.replace("</head>", reloadScript);
}