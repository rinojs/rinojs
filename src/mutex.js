module.exports = class Mutex
{
    constructor()
    {
        this.locked = false;
        this.waitingQueue = [];
    }

    async acquire()
    {
        return new Promise((resolve) =>
        {
            if (!this.locked)
            {
                this.locked = true;
                resolve();
            }
            else
            {
                this.waitingQueue.push(resolve);
            }
        });
    }

    async release()
    {
        if (this.waitingQueue.length > 0)
        {
            const resolve = this.waitingQueue.shift();
            resolve();
        }
        else
        {
            this.locked = false;
        }
    }
}