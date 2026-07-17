export function renderDiagnostic(scope, error)
{
    const message = error instanceof Error ? error.message : String(error);
    return `${ scope }: ${ message }`;
}
