export function spin(str: string): string {
    return str.replace(/\[([^\[\]]+?)]/g, (_, options) => {
        const parts = options.split('|');
        return parts[Math.floor(Math.random() * parts.length)];
    });
}