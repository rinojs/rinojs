module.exports = class Semaphore
{
    constructor(maxConcurrent)
    {
        this.maxConcurrent = maxConcurrent;
        this.count = 0;
        this.waitingQueue = [];

    }

    async acquire() 
    {
        return new Promise((resolve) =>
        {
            if (this.count < this.maxConcurrent)
            {
                this.count++; resolve();

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
            const resolve = this.waitingQueue.shift(); resolve();
        }
        else 
        {
            this.count--;
        }
    }

};