async function injectReload(data, port)
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
    return data.replace("</head>", reloadScript);
}

module.exports = { injectReload }