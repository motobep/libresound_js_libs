import { PS } from './MusicPlayer';

/**
 * App's Downloader
 */
export class Downloader {
    async addAsync(id: string, title: string) {
        await PS('downloads__add', { id: id, title: title });
    }
    async updateAsync(id: string, title: string) {
        await PS('downloads__update', { id: id, title: title });
    }
    async hasAsync(id: string) {
        return await PS('downloads__has', { id: id });
    }
    async removeAsync(id: string) {
        return await PS('downloads__remove', { id: id });
    }
    async freeAsync(id: string) {
        return await PS('downloads__free', { id: id });
    }
}
