
export function removeLWS (input)
{
    const lines = input.split('\n');
    let inCodeBlock = false;

    return lines
        .map(line =>
        {
            if (line.trim().startsWith('```'))
            {
                inCodeBlock = !inCodeBlock;
                return line.replace(/^\s*/, '');
            }
            if (inCodeBlock)
            {
                return line;
            }
            return line.replace(/^\s*/, '');
        })
        .join('\n');
}

export function removeCodeLWS (input)
{
    const lines = input.split('\n');
    let inCodeBlock = false;
    let codeBlockLines = [];
    const result = [];

    for (const line of lines)
    {
        if (line.trim().startsWith('```'))
        {
            if (inCodeBlock)
            {
                const minIndent = Math.min(
                    ...codeBlockLines
                        .filter(l => l.trim() !== '')
                        .map(l => l.match(/^\s*/)[0].length)
                );

                result.push(
                    ...codeBlockLines.map(l => l.slice(minIndent))
                );

                codeBlockLines = [];
            }

            inCodeBlock = !inCodeBlock;
            result.push(line);
        }
        else if (inCodeBlock)
        {
            codeBlockLines.push(line);
        }
        else
        {
            result.push(line);
        }
    }

    return result.join('\n');
}