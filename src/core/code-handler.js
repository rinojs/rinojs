const vm = require('vm');

function getResultFromCode(code)
{
    return new Promise((resolve, reject) =>
    {
        try 
        {
            // Passing __dirname can make it use of installed packages
            const context = vm.createContext({
                console: console,
                require: require,
                result: ""
            });

            vm.runInContext(code, context);

            if (context.result) resolve(context.result);
            else resolve("");
        }
        catch (error)
        {
            console.log(error);
            reject("");
        }
    });
}

module.exports = { getResultFromCode }