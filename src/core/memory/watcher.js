import chokidar from "chokidar";

export function createBuildWatcher(paths, onChanges, debounceMs = 40)
{
    let timer;
    const changes = new Map();
    const watcher = chokidar.watch(paths, { ignoreInitial: true });

    watcher.on("all", (event, filePath) =>
    {
        changes.set(filePath, event);
        clearTimeout(timer);
        timer = setTimeout(async () =>
        {
            const batch = [...changes].map(([path, type]) => ({ path, type }));
            changes.clear();
            try { await onChanges(batch); }
            catch (error) { console.error("Incremental build failed:", error); }
        }, debounceMs);
    });

    return watcher;
}

export function waitForWatcher(watcher)
{
    return new Promise((resolve, reject) =>
    {
        const ready = () =>
        {
            watcher.off("error", failed);
            resolve();
        };
        const failed = error =>
        {
            watcher.off("ready", ready);
            reject(error);
        };
        watcher.once("ready", ready);
        watcher.once("error", failed);
    });
}
