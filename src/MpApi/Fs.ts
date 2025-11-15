import { SendMessageType } from '@MpApi/Runtime'
export declare const sendMessage: SendMessageType

export class Fs {
    async readFile(path: string,
        options: { encoding: string, flag: string } | string = ''): Promise<string> {
        return await sendMessage('MpRuntime.fs.readFile',
            JSON.stringify({ 'path': path, 'options': options }));
    }

    existsSync(path: string): boolean {
        return sendMessage('MpRuntime.fs.existsSync',
            JSON.stringify({ 'path': path }));
    }

    readFileSync(path: string,
        options: { encoding: string, flag: string } | string = ''): string {
        return sendMessage('MpRuntime.fs.readFileSync',
            JSON.stringify({ 'path': path, 'options': options }));
    }

    async mpReadAsset(path: string): Promise<string> {
        return await sendMessage('MpRuntime.fs.mpReadAsset',
            JSON.stringify({ 'path': path }));
    }
}
