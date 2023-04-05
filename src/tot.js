const fs = require('fs');
const { Transform } = require('stream');
const Mutex = require('./mutex');

module.exports = class Tot
{
    constructor(filename = undefined, encoding = 'utf8', highWaterMark = 64 * 1024)
    {
        this.filename = filename;
        this.encoding = encoding;
        this.highWaterMark = highWaterMark;
        this.readingCount = 0;
        this.lock = false;
        this.mutex = new Mutex();
    }

    async open(filename)
    {
        this.filename = filename;
    }

    async close()
    {
        this.filename = undefined;
    }

    async create()
    {
        fs.writeFile(this.filename, '', { encoding: this.encoding }, (error) =>
        {
            console.error(error);
        });
    }

    async getDataByName(name)
    {
        if (!name)
        {
            console.error("getDataByName Error: name is undefined or null or empty");
            return "";
        }

        let data = await new Promise((resolve, reject) =>
        {
            if (!this.lock)
            {
                this.readingCount = this.readingCount + 1;

                this.processGetDataByName(name).then(data =>
                {
                    this.readingCount = this.readingCount - 1;
                    resolve(data);
                }).catch(error =>
                {
                    this.readingCount = this.readingCount - 1;
                    reject(error);
                });
            }
        }).catch(error => { console.error(error); return ""; });

        data = await data.replaceAll("<|~", "<d:");
        data = await data.replaceAll("<?|~", "</d:");
        return data;
    }

    processGetDataByName(name)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>`;
            let tagEnd = `</d:${ name }>`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let tagEnded = false;
            let index = 0;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    if (!inTag)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            inTag = true;
                            processingChunk = processingChunk.slice(index + tagStart.length);
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }
                    else
                    {
                        index = processingChunk.indexOf(tagEnd);

                        if (index > -1)
                        {
                            inTag = false;
                            data += processingChunk.substring(0, index);
                            processingChunk = "";
                            tagEnded = true;
                            resolve(data);
                            reader.close();
                        }
                        else
                        {
                            data += processingChunk.slice(0, -tagEnd.length)
                            previousChunk = processingChunk.slice(-tagEnd.length);
                            processingChunk = "";
                            break;
                        }
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                if (!tagEnded)
                {
                    reject(`getDataByName Error: Tag "<d:${ name }>" not found in file`);
                }
                else if (inTag)
                {
                    reject(`getDataByName Error: No closing tag "</d:${ name }>" found for "<d:${ name }>"`);
                }
            });
        }).catch(error => { throw error; });
    }

    async push(name, data)
    {
        if (!name || !data)
        {
            console.error(`push Error: name or data may not be appropriate`);
            return false;
        }
        else if (data.includes("<|~") || data.includes("<?|~"))
        {
            console.error(`push Error: The data must not contain the following characters: "<|~" or "<?|~"`);
            return false;
        }

        let isExists = await this.isOpenTagExists(name);

        if (isExists.result)
        {
            console.error(`push Error: Tag "<d:${ name }>" is found in file`)
            return false;
        }

        await this.waitForReadingCountToBeZero()
        this.lock = true;
        await this.mutex.acquire();

        data = await data.replaceAll("<d:", "<|~");
        data = await data.replaceAll("</d:", "<?|~");
        let result = await this.processPushing(name, data);

        await this.mutex.release();
        this.lock = false;
        return result;
    }

    processPushing(name, data)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>\n`;
            let tagEnd = `\n</d:${ name }>\n`;
            let content = tagStart + data + tagEnd;

            const writer = fs.createWriteStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, flags: "a" });

            writer.on('error', (error) =>
            {
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });
            writer.write(content);
            writer.end();
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    async update(name, data)
    {
        if (!name || !data)
        {
            console.error(`update Error: name or data may not be appropriate`);
            return false;
        }
        else if (data.includes("<|~") || data.includes("<?|~"))
        {
            console.error(`update Error: The data must not contain the following characters: "<|~" or "<?|~"`);
            return false;
        }

        let isExists1 = await this.isOpenTagExists(name);
        let isExists2 = await this.isCloseTagExists(name);

        if (!isExists1.result || !isExists2.result)
        {
            console.error(`update Error: Tag "<d:${ name }>" is not found in file`)
            return false;
        }
        else if (isExists1.position < 0 || isExists2.position < 0)
        {
            console.error(`update Error: file position cannot be negative`);
            return false;
        }

        await this.waitForReadingCountToBeZero()
        this.lock = true;
        await this.mutex.acquire();

        let result1 = await this.processRemoveOpenTag(name, isExists1.position);
        let result2 = await this.processRemoveCloseTag(name, isExists2.position);

        if (!result1 || !result2)
        {
            console.error(`update Error: Could not remove "<d:${ name }>". Data is not inserted. Try clean a file and then 'push' data instead of using 'update'.`)
            return false;
        }

        data = await data.replaceAll("<d:", "<|~");
        data = await data.replaceAll("</d:", "<?|~");
        let result = await this.processPushing(name, data);

        await this.mutex.release();
        this.lock = false;
        return result;
    }


    async hardUpdate(name, data)
    {
        if (!name || !data)
        {
            console.error(`hardUpdate Error: name or data may not be appropriate`);
            return false;
        }
        else if (data.includes("<|~") || data.includes("<?|~"))
        {
            console.error(`hardUpdate Error: The data must not contain the following characters: "<|~" or "<?|~"`);
            return false;
        }

        let isExists1 = await this.isOpenTagExists(name);
        let isExists2 = await this.isCloseTagExists(name);

        if (!isExists1.result || !isExists2.result)
        {
            console.error(`hardUpdate Error: Tag "<d:${ name }>" is not found in file`)
            return false;
        }
        else if (isExists1.position < 0 || isExists2.position < 0)
        {
            console.error(`hardUpdate Error: file position cannot be negative`);
            return false;
        }

        await this.waitForReadingCountToBeZero()
        this.lock = true;
        await this.mutex.acquire();

        let resultRemove = await this.processHardRemove(name);
        await fs.promises.rename(`${ this.filename }.tmp`, this.filename)
            .catch((error) => { resultRemove = false; console.error(error); });

        if (!resultRemove)
        {
            console.error(`hardUpdate Error: Could not remove "<d:${ name }>". Data is not inserted. Try clean a file and then 'push' data instead of using 'hardUpdate'.`)
            return false;
        }

        data = await data.replaceAll("<d:", "<|~");
        data = await data.replaceAll("</d:", "<?|~");
        let result = await this.processPushing(name, data);

        await this.mutex.release();
        this.lock = false;
        return result;
    }

    async isOpenTagExists(name)
    {
        if (!name) throw new Error("isOpenTagExists Error: name may not be appropriate");

        return new Promise((resolve, reject) =>
        {
            if (!this.lock)
            {
                this.readingCount = this.readingCount + 1;

                this.processIsOpenTagExists(name).then(result =>
                {
                    this.readingCount = this.readingCount - 1;
                    resolve(result);
                }).catch(error =>
                {
                    this.readingCount = this.readingCount - 1;
                    reject(error);
                });
            }
        }).catch(error => { console.error(error); })
    }

    processIsOpenTagExists(name)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>`;
            let processingChunk = "";
            let previousChunk = "";
            let indexStart = 0;
            let founded = false;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    indexStart = processingChunk.indexOf(tagStart);

                    if (indexStart > -1)
                    {
                        founded = true;
                        let position = reader.bytesRead - this.highWaterMark;
                        if (position < 0) position = 0;

                        let chunkLength = Buffer.byteLength(processingChunk, this.encoding);
                        let margin = chunkLength - this.highWaterMark;

                        processingChunk = processingChunk.substring(0, indexStart)
                        if (margin < 0) margin = 0;
                        position = position + Buffer.byteLength(processingChunk, this.encoding) - margin;

                        resolve({ result: true, position: position });
                        reader.close();
                        break;
                    }
                    else
                    {
                        previousChunk = processingChunk.slice(-tagStart.length);
                        processingChunk = "";
                        break;
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                if (!founded) resolve({ result: false, position: -1 });
            });
        }).catch(error => { throw error; });
    }

    async isCloseTagExists(name)
    {
        if (!name) throw new Error("isCloseTagExists Error: name may not be appropriate");

        return new Promise((resolve, reject) =>
        {
            if (!this.lock)
            {
                this.readingCount = this.readingCount + 1;

                this.processIsCloseTagExists(name).then(result =>
                {
                    this.readingCount = this.readingCount - 1;
                    resolve(result);
                }).catch(error =>
                {
                    this.readingCount = this.readingCount - 1;
                    reject(error);
                });
            }
        }).catch(error => { console.error(error); })
    }

    processIsCloseTagExists(name)
    {
        return new Promise((resolve, reject) =>
        {
            let tagClose = `</d:${ name }>`;
            let processingChunk = "";
            let previousChunk = "";
            let index = 0;
            let founded = false;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    index = processingChunk.indexOf(tagClose);

                    if (index > -1)
                    {
                        founded = true;
                        let position = reader.bytesRead - this.highWaterMark;
                        if (position < 0) position = 0;

                        let chunkLength = Buffer.byteLength(processingChunk, this.encoding);
                        let margin = chunkLength - this.highWaterMark;

                        processingChunk = processingChunk.substring(0, index)
                        if (margin < 0) margin = 0;
                        position = position + Buffer.byteLength(processingChunk, this.encoding) - margin;

                        resolve({ result: true, position: position });
                        reader.close();
                        break;
                    }
                    else
                    {
                        previousChunk = processingChunk.slice(-tagClose.length);
                        processingChunk = "";
                        break;
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                if (!founded) resolve({ result: false, position: -1 });
            });
        }).catch(error => { throw error; });
    }

    // It only replace data with empty space from file. 
    async hardRemove(name)
    {
        if (!name)
        {
            console.error(`hardRemove Error: name may not be appropriate`);
            return false;
        }

        let isExists = await this.isOpenTagExists(name);

        if (!isExists.result)
        {
            console.error(`hardRemove Error: Tag "<d:${ name }>" is not found in file`)
            return false;
        }
        else if (isExists.position < 0)
        {
            console.error(`hardRemove Error: file position cannot be negative`);
            return false;
        }

        await this.waitForReadingCountToBeZero();
        this.lock = true;
        await this.mutex.acquire();

        let result = await this.processHardRemove(name);

        await fs.promises.rename(`${ this.filename }.tmp`, this.filename)
            .catch((error) => { result = false; console.error(error); });

        await this.mutex.release();
        this.lock = false;
        return result;
    }

    // This is expansive for large file.
    processHardRemove(name)
    {
        return new Promise((resolve, reject) =>
        {
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let indexStartTagStart = 0;
            let indexStartTagEnd = 0;
            let indexEndTag = 0;
            let tagName = ""
            let startTag = "";
            let endTag = "";
            let content = "";
            let wholeTag = "";

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });
            const writer = fs.createWriteStream(`${ this.filename }.tmp`, { encoding: this.encoding });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    while (processingChunk.length > 0)
                    {
                        if (!inTag)
                        {
                            indexStartTagStart = processingChunk.indexOf('<d:');

                            if (indexStartTagStart > -1)
                            {
                                processingChunk = processingChunk.substring(indexStartTagStart);
                                indexStartTagStart = processingChunk.indexOf('<d:');
                                indexStartTagEnd = processingChunk.indexOf('>');

                                if (indexStartTagEnd < 0)
                                {
                                    previousChunk = processingChunk;
                                    processingChunk = "";
                                    break;
                                }

                                tagName = processingChunk.substring(indexStartTagStart + 3, indexStartTagEnd);
                                processingChunk = processingChunk.substring(indexStartTagStart + tagName.length + 4);
                                startTag = `<d:${ tagName }>`;
                                endTag = `</d:${ tagName }>`;
                                wholeTag += startTag;
                                inTag = true;
                            }
                            else
                            {
                                previousChunk = processingChunk.slice(-3);
                                processingChunk = "";
                                break;
                            }
                        }
                        else
                        {
                            indexEndTag = processingChunk.indexOf(endTag);

                            if (indexEndTag > -1)
                            {
                                content = processingChunk.substring(0, indexEndTag);

                                wholeTag += `${ content }${ endTag }\n`;
                                processingChunk = processingChunk.substring(indexEndTag + endTag.length);

                                if (tagName !== name) this.push(wholeTag);
                                wholeTag = "";
                                inTag = false;
                            }
                            else
                            {
                                wholeTag += processingChunk.slice(0, -endTag.length)
                                previousChunk = processingChunk.slice(-endTag.length);
                                processingChunk = "";
                                break;
                            }
                        }

                        if (processingChunk.length <= endTag.length)
                        {
                            previousChunk = processingChunk;
                            processingChunk = "";
                            break;
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    async remove(name)
    {
        if (!name)
        {
            console.error(`remove Error: name may not be appropriate`);
            return false;
        }

        let isExists1 = await this.isOpenTagExists(name);
        let isExists2 = await this.isCloseTagExists(name);

        if (!isExists1.result || !isExists2.result)
        {
            console.error(`remove Error: Tag "<d:${ name }>" is not found in file`)
            return false;
        }
        else if (isExists1.position < 0 || isExists2.position < 0)
        {
            console.error(`remove Error: file position cannot be negative`);
            return false;
        }

        await this.waitForReadingCountToBeZero();
        this.lock = true;
        await this.mutex.acquire();

        let result1 = await this.processRemoveOpenTag(name, isExists1.position);
        let result2 = await this.processRemoveCloseTag(name, isExists2.position);
        let result = true;

        if (result1 && result2) result = true;
        else result = false;

        await this.mutex.release();
        this.lock = false;
        return result;
    }


    processRemoveOpenTag(name, position)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let index = 0;
            let emptyString = `<r:${ name }>`;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position });
            const writer = fs.createWriteStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position, flags: "r+" });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    data = processingChunk;

                    while (processingChunk.length > 0)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            data = data.replace(tagStart, emptyString);
                            while (Buffer.byteLength(data, this.encoding) > this.highWaterMark)
                            {
                                data = data.substring(1);
                            }
                            this.push(data);
                            reader.close();
                            writer.end();
                            break;
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    processRemoveCloseTag(name, position)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `</d:${ name }>`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let index = 0;
            let emptyString = `</r:${ name }>`;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position });
            const writer = fs.createWriteStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position, flags: "r+" });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    data = processingChunk;

                    while (processingChunk.length > 0)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            data = data.replace(tagStart, emptyString);
                            while (Buffer.byteLength(data, this.encoding) > this.highWaterMark)
                            {
                                data = data.substring(1);
                            }
                            this.push(data);
                            reader.close();
                            writer.end();
                            break;
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    // This is expansive for large file.
    // Remove all non-tag data from a file.
    async clean()
    {
        await this.waitForReadingCountToBeZero();
        this.lock = true;
        await this.mutex.acquire();

        let result = await this.processClean();

        await fs.promises.rename(`${ this.filename }.tmp`, this.filename)
            .catch((error) => { result = false; console.error(error); });

        await this.mutex.release();
        this.lock = false;
        return result;
    }

    processClean()
    {
        return new Promise((resolve, reject) =>
        {
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let indexStartTagStart = 0;
            let indexStartTagEnd = 0;
            let indexEndTag = 0;
            let tagName = ""
            let startTag = "";
            let endTag = "";
            let content = "";
            let wholeTag = "";

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });
            const writer = fs.createWriteStream(`${ this.filename }.tmp`, { encoding: this.encoding });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    while (processingChunk.length > 0)
                    {
                        if (!inTag)
                        {
                            indexStartTagStart = processingChunk.indexOf('<d:');

                            if (indexStartTagStart > -1)
                            {
                                processingChunk = processingChunk.substring(indexStartTagStart);
                                indexStartTagStart = processingChunk.indexOf('<d:');
                                indexStartTagEnd = processingChunk.indexOf('>');

                                if (indexStartTagEnd < 0)
                                {
                                    previousChunk = processingChunk;
                                    processingChunk = "";
                                    break;
                                }

                                tagName = processingChunk.substring(indexStartTagStart + 3, indexStartTagEnd);
                                processingChunk = processingChunk.substring(indexStartTagStart + tagName.length + 4);
                                startTag = `<d:${ tagName }>`;
                                endTag = `</d:${ tagName }>`;
                                wholeTag += startTag;
                                inTag = true;
                            }
                            else
                            {
                                previousChunk = processingChunk.slice(-3);
                                processingChunk = "";
                                break;
                            }
                        }
                        else
                        {
                            indexEndTag = processingChunk.indexOf(endTag);

                            if (indexEndTag > -1)
                            {
                                content = processingChunk.substring(0, indexEndTag);

                                wholeTag += `${ content }${ endTag }\n`;
                                processingChunk = processingChunk.substring(indexEndTag + endTag.length);

                                this.push(wholeTag);
                                wholeTag = "";
                                inTag = false;
                            }
                            else
                            {
                                wholeTag += processingChunk.slice(0, -endTag.length)
                                previousChunk = processingChunk.slice(-endTag.length);
                                processingChunk = "";
                                break;
                            }
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    // Deprecated since we are not allowing escaping for tags
    async escapeTags(data)
    {
        let result = [];

        for (let i = 0; i < data.length; i++)
        {
            if ((data[i] == '<' && data.substring(i, i + 3) == '<b:' || data.substring(i, i + 4) == '</b:') && (i == 0 || data[i - 1] != '\\'))
            {
                result.push('\\');
            }

            result.push(data[i]);
        }

        return result.join('');
    }

    // Deprecated since we are not allowing escaping for tags
    async unescapeTags(data)
    {
        let result = [];

        for (let i = 0; i < data.length; i++)
        {
            if (data[i] == '\\' && (data.substring(i + 1, i + 4) == '<b:' || data.substring(i + 1, i + 5) == '</b:'))
            {
                i++;
            }

            result.push(data[i]);
        }

        return result.join('');
    }

    waitForReadingCountToBeZero()
    {
        return new Promise(resolve =>
        {
            const checkCount = () =>
            {
                if (this.readingCount === 0)
                {
                    resolve();
                } else
                {
                    setTimeout(checkCount, 10);
                }
            };
            checkCount();
        });
    }
}
