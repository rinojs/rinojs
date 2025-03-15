import vm from "vm";

export function getResultFromCode(code) {
  try {
    const context = vm.createContext({
      console: console,
      result: "",
    });

    vm.runInContext(code, context);

    if (context.result instanceof Promise) {
      return context.result
        .then((resolved) => resolved)
        .catch((error) => {
          console.error(error);
          return "";
        });
    }

    if (context.result) return context.result;
    else return "";
  } catch (error) {
    console.error(error);
    return "";
  }
}
