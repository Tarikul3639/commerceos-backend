export function getDocumentPrefix(prefix: string): string {
    const date = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

    return `${prefix}-${date}`;
}

export function generateDocumentNumber(
    prefix: string,
    sequence: number,
    padding = 4,
): string {
    return `${prefix}-${String(sequence).padStart(padding, '0')}`;
}