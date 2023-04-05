const state = `
    <script type="text/javascript">
    window.rino = {};
    window.rino.state = {
        async get(name, callback)
        {
            await callback();
            return this[name];
        },
        async set(name, value, callback)
        {
            if(typeof value === "object")
            {
                if(JSON.stringify(this[name]) === JSON.stringify(value)) return;

                this[name] = value;

                await callback();
            }
            else
            {
                this[name] = value;
                const elements = document.getElementsByClassName(name);
                
                for(let i = 0; i < elements.length; i++)
                {
                    elements[i].innerHTML = value;
                }

                await callback();
            }
        }
    }
    </script>
    `