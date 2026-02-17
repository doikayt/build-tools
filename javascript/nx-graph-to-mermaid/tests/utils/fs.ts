import fs from 'fs';

export function safeUnlink(path: string): void {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}
