import { z } from 'zod';

import { ListType, NavType, PlayState, RightControlsType } from './enums'
import { ActionBtnDescr, Control, DownloadProps, ItemAction, KeyValue, MusicItem, PageHeaderDescr, sActionBtnDescr, sControl, SectionDescr, sItem, sItemAction, sKeyValue, sMusicItem, sNavType, sPageHeaderDescr, sSectionDescr, MusicPageDescr, ControlsPageDescr, sMusicPageDescrUntyped, MusicPageDescrUntyped, ControlsPageDescrUntyped, sControlsPageDescrUntyped, PageDescr, sPageDescr, GroupItem, sPlayState, Item, sTabs, sSearchTabs, Tabs } from './types'
import { downloader } from './Downloader';
import { Runtime, SendMessageType, BytesFetcher } from '@runtime/Runtime'
import { FuncsManager, FuncsPool } from '@runtime/internal/FuncsManager';
import { Logger } from '@runtime/Logger'
import { testAllPS } from './testAllPS';


export declare const sendMessage: SendMessageType


export function PS(a: string, b: any = null) {
    return sendMessage(`PS.${a}`, JSON.stringify(b));
}

/**
 * The class to interact with the app
 */
export class MusicPlayerClass {
    runtime: Runtime = new Runtime()
    source = new Source()
    playback = new Playback()
    queue = new Queue()
    downloader = downloader
    downloadsState = new DownloadsState()
    propertyStorage = new PropertyStorage()
    helpers = new Helpers()
    logger = new Logger('🔌MusicPlayer: ')
    settings = {
        logger: new Logger('🔌settings '),
        async setControlsAsync(controls: Control[]) {
            z.array(sControl).parse(controls)
            _checkControls(controls)

            const controlsPool = 'controlsPool'
            if (MusicPlayer._funcsManager.contains(controlsPool)) {
                MusicPlayer._funcsManager.deletePool(controlsPool);
            }
            MusicPlayer._funcsManager.makePool(controlsPool);
            _addControlsToPool(controls, controlsPool)

            await PS('settings.setControlsAsync', controls);
        },
    }

    _funcsManager = new FuncsManager()
    _PS = (...args: any[]) => PS(...args)

    testAllPS = (...args) => testAllPS(PS, ...args)

    /**
     * Get currently used language
     */
    async getLanguageAsync(): Promise<string> {
        return await PS('getLanguageAsync');
    }

    /**
     * Opens this plugin's source
     */
    async toThisSourceAsync(): Promise<void> {
        return await PS('toThisSourceAsync');
    }

    /**
     * Shows actions dialog
     */
    async showActionsDialogAsync(actions: ItemAction[], tapPos: number[] | null = null): Promise<void> {
        z.array(sItemAction).parse(actions)
        z.nullable(z.array(z.number()))
        this._actions = actions
        await PS('showActionsDialogAsync', { tapPos });
    }

    /**
     * Closes actions dialog
     */
    async closeActionsDialogAsync(): Promise<void> {
        await PS('closeActionsDialogAsync');
    }

    _actions: any

    // TODO: USE caching
    // File? cachedFile = (await getCachedWebFile(mi.id));
    // if (cachedFile != null) {
    //   logger.log('From cache');
    //   mi.filepath = cachedFile.path;
    //   mi.downloaderType = DownloaderType.filepath;
    //   return mi;
    // }
    // TODO: make bytes example
    // var bytes = await mi.fetchBytes();
    // if (bytes.isEmpty) {
    //   throw 'logger.error downloading bytes - length == 0';
    // }
    //
    // var newFile = await writeBytesWithTagsToCache(bytes, mi);
    // // Download not aborted
    // mi.filepath = newFile.path;
    async saveMiIfCachedAsync(mi: MusicItem): Promise<string> {
        return await PS('saveMiIfCachedAsync', { mi });
    }

    async saveMiAsync(mi: MusicItem, bytes: number[]): Promise<string> {
        return await PS('saveMiAsync', { mi, bytes });
    }

    async showSnackBarAsync(message: string) {
        await PS('showSnackBarAsync', { message })
    }

    async reloadFsSourceAsync() {
        await PS('reloadFsSourceAsync')
    }

    /**
     * Updates app state.
     * Use this method to update UI after changing app state.
     */
    async updateAppStateAsync(): Promise<void> {
        await PS('updateAppStateAsync');
    }

    isMusicItem(item: Item): boolean {
        return 'extension' in item
    }
}

/**
 * App's Source
 */
export class Source {
    currPageStack = new CurrPageStack()
    currMusicPage = new CurrMusicPage()
    errorManager = new ErrorManager()

    async initPageStacksAsync(map: {
        [name: string]: PageDescr[]
    }): Promise<void> {
        z.record(z.string(), z.array(sPageDescr)).parse(map)

        for (let name in map) {
            let stack = map[name]
            for (let i in stack) {
                let page = stack[i]
                if (page.type === 'controls') {
                    let currPageId = `${name}.${i}`
                    MusicPlayer._funcsManager.makePool(currPageId);
                    _addControlsToPool(page.controls, currPageId)
                }
            }
        }

        await PS('initPageStacksAsync', map);
    }

    async currPageStackName_getAsync(): Promise<string> {
        return await PS('currPageStackName_getAsync')
    }

    async currPageStackName_setAsync(value: string) {
        z.string().parse(value)
        await PS('currPageStackName_setAsync', value)
    }

    async currTabIdx_getAsync(): Promise<number> {
        return await PS('currTabIdx_getAsync')
    }

    async currTabIdx_setAsync(value: number) {
        z.number().nonnegative().parse(value, { reportInput: true })
        await PS('currTabIdx_setAsync', value)
    }

    // returns: [[TabNameString, IconName], ...]
    async tabs_getAsync(): Promise<string[][]> {
        return await PS('tabs_getAsync')
    }

    // value: [[TabNameString, IconName], ...]
    async tabs_setAsync(value: Tabs) {
        sTabs.parse(value, { reportInput: true })
        await PS('tabs_setAsync', value)
    }

    async currSearchTabIdx_getAsync(): Promise<number> {
        return await PS('currSearchTabIdx_getAsync')
    }

    async currSearchTabIdx_setAsync(value: number) {
        z.number().nonnegative().parse(value, { reportInput: true })
        await PS('currSearchTabIdx_setAsync', value)
    }

    async searchTabs_getAsync(): Promise<string[]> {
        return await PS('searchTabs_getAsync')
    }

    async searchTabs_setAsync(value: string[]) {
        sSearchTabs.parse(value, { reportInput: true })
        await PS('searchTabs_setAsync', value)
    }

    async navType_getAsync(): Promise<NavType> {
        return await PS('navType_getAsync')
    }

    async navType_setAsync(value: NavType) {
        sNavType.parse(value)
        await PS('navType_setAsync', value)
    }

    async isShowPreloader_getAsync(): Promise<boolean> {
        return await PS('isShowPreloader_getAsync')
    }

    async isShowPreloader_setAsync(value: boolean) {
        z.boolean().parse(value)
        await PS('isShowPreloader_setAsync', value)
    }

    async isShowSearch_getAsync(): Promise<boolean> {
        return await PS('isShowSearch_getAsync')
    }

    async isShowSearch_setAsync(value: boolean) {
        z.boolean().parse(value)
        await PS('isShowSearch_setAsync', value)
    }

    async rightControls_getAsync(): Promise<RightControlsType[]> {
        return await PS('rightControls_getAsync')
    }

    async rightControls_setAsync(value: RightControlsType[]) {
        z.array(z.string()).parse(value)
        await PS('rightControls_setAsync', value)
    }


    async updateThumbnailFromUrlAsync(id: string, url: string): Promise<boolean> {
        z.string().parse(id)
        z.string().parse(url)
        return await PS('updateThumbnailFromUrlAsync', { id: id, url: url });
    }
}

/**
 * Current Page Stack.
 */
export class CurrPageStack {
    async lengthAsync(): Promise<number> {
        return await PS('currPageStack.length_getAsync');
    }
    async last_getAsync(): Promise<PageDescr> {
        return await PS('currPageStack.last_getAsync');
    }
    async last_setAsync(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr)
        MusicPlayer.logger.log('setLast')

        MusicPlayer._funcsManager.deletePool(await _getCurrPageIdAsync());

        if (await _getCurrPageTypeAsync() === 'music') {
            _addNamesToActionBtns((pageDescr as MusicPageDescr))
        }

        await PS('currPageStack.last_setAsync', pageDescr);

        let currPageId = await _getCurrPageIdAsync()
        /// Funcs pool for a page removed in back() in dart
        MusicPlayer._funcsManager.makePool(currPageId)

        if (await _getCurrPageTypeAsync() === 'music') {
            _addActionBtnsToPool((pageDescr as MusicPageDescr), currPageId)
        }
        if (await _getCurrPageTypeAsync() === 'controls') {
            _addControlsToPool((pageDescr as ControlsPageDescr).controls, currPageId)
        }
    }
    async pushAsync(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr, { reportInput: true })
        // MusicPlayer.logger.log('pushAsync')

        if (await _getCurrPageTypeAsync() === 'music') {
            _addNamesToActionBtns((pageDescr as MusicPageDescr))
        }

        await PS('currPageStack.push', pageDescr);

        let currPageId = await _getCurrPageIdAsync()
        /// Funcs pool for a page removed in back() in dart
        MusicPlayer._funcsManager.makePool(currPageId);

        if (await _getCurrPageTypeAsync() === 'music') {
            _addActionBtnsToPool((pageDescr as MusicPageDescr), currPageId)
        }
        if (await _getCurrPageTypeAsync() === 'controls') {
            _addControlsToPool((pageDescr as ControlsPageDescr).controls, currPageId)
        }
    }
}

async function _getCurrPageIdAsync(): Promise<string> {
    return await PS('currPage.IdAsync');
}
async function _getCurrPageTypeAsync(): Promise<string> {
    return await PS('currPage.typeAsync');
}

/**
 * Current Music Page.
 * Don't use it if current page is not a Music Page
 */
export class CurrMusicPage {
    async title_getAsync(): Promise<string> {
        return await PS('currMusicPage.title_getAsync')
    }

    async title_setAsync(value: string) {
        z.string().parse(value)
        await PS('currMusicPage.title_setAsync', value)
    }

    async sectionlist_getAsync(): Promise<SectionDescr> {
        return await PS('currMusicPage.sectionlist_getAsync')
    }

    async sectionlist_setAsync(value: SectionDescr) {
        sSectionDescr.parse(value)

        await _addActionsForCurrPageAsync(value)
        await PS('currMusicPage.sectionlist_setAsync', value)
    }

    async header_getAsync(): Promise<PageHeaderDescr> {
        return await PS('currMusicPage.header_getAsync')
    }

    async header_setAsync(value: PageHeaderDescr) {
        sPageHeaderDescr.parse(value)

        await _addActionsForCurrPageAsync(value)
        await PS('currMusicPage.header_setAsync', value)
    }

    async acitonBtn_getAsync(): Promise<ActionBtnDescr> {
        return await PS('currMusicPage.acitonBtn_getAsync')
    }

    async acitonBtn_setAsync(value: ActionBtnDescr) {
        sActionBtnDescr.parse(value)

        await _addActionsForCurrPageAsync(value)
        await PS('currMusicPage.acitonBtn_setAsync', value)
    }

    async props_getAsync(): Promise<KeyValue> {
        return await PS('currMusicPage.props_getAsync')
    }

    async props_setAsync(value: KeyValue) {
        sKeyValue.parse(value)
        await PS('currMusicPage.props_setAsync', value)
    }
}

async function _addActionsForCurrPageAsync(value: object) {
    let currPageId = await _getCurrPageIdAsync()
    _addNamesToActionBtns(value)
    _addActionBtnsToPool(value, currPageId)
}

/**
 * App's Playback
 */
export class Playback {
    // /**
    //  * Play track by [index] from Queue
    //  */
    // async playByIdxAsync(index: number) {
    //     z.number().nonnegative().parse(index)
    //     await PS('playback.playByIdx', index);
    // }

    async stopWithAsync(state: PlayState) {
        sPlayState.parse(state)
        await PS('playback.stopWithAsync', state);
    }

    async setUrlSourceAsync(mi: MusicItem) {
        sMusicItem.parse(mi)
        return await PS('playback.setUrlSourceAsync', mi);
    }

    async setByteStreamSourceAsync(mi: MusicItem) {
        sMusicItem.parse(mi)
        return await PS('playback.setByteStreamSourceAsync', mi);
    }

    async pushBufferAsync(buffer: number[]) {
        z.array(z.number()).parse(buffer)
        return await PS('playback.pushBufferAsync', buffer);
    }

    async flushBuffersAsync() {
        return await PS('playback.flushBuffersAsync', {});
    }

    async setPositionAsync(milliseconds: number) {
        z.int().nonnegative().parse(milliseconds)
        return await PS('playback.setPositionAsync', { milliseconds });
    }

    async addOnUpdateListenerAsync(fn: (ms: number) => void) {
        let poolName = Playback._updateListenersPoolName
        let fnName = 'onUpdate'
        let pool: FuncsPool
        if (MusicPlayer._funcsManager.contains(poolName)) {
            pool = MusicPlayer._funcsManager.getPool(poolName)
        } else {
            pool = MusicPlayer._funcsManager.makePool(poolName)
        }
        pool.addWithId(fn, fnName)
        return await PS('playback.addOnUpdateListenerAsync', { fnName });
    }

    static _updateListenersPoolName = '_updateListenersPool'
}

/**
 * App's Queue
 */
export class Queue {
    /**
     * Inserts [list] at [index] in the queue
     */
    async insertAllAsync(index: number, list: MusicItem[]): Promise<void> {
        z.number().nonnegative().parse(index)
        z.array(sMusicItem).parse(list)
        await PS('queue.insertAllAsync', { index: index, list: list });
    }
    /**
     * Adds [list] at the end of the queue
     */
    async addAllAsync(list: MusicItem[]): Promise<void> {
        z.array(sMusicItem).parse(list, {
            reportInput: true
        })
        await PS('queue.addAllAsync', list);
    }
    /**
     * Removes a range of elements from the queue.
     * Removes the elements with positions greater than or equal to [start]
     * and less than [end], from the queue.
    */
    async removeRangeAsync(start: number, end: number): Promise<void> {
        z.number().nonnegative().parse(start)
        z.number().nonnegative().parse(end)
        await PS('queue.removeRangeAsync', { start: start, end: end });
    }
    /**
     * Removes items before and after the current track.
     * Only this track will remain
     */
    async clearAsync(): Promise<void> {
        await PS('queue.clearAsync');
    }
    /**
     * Returns [MusicItem] by [index] from the queue
     */
    async getTrackAsync(index: number): Promise<MusicItem> {
        z.number().nonnegative().parse(index)
        return await PS('queue.getTrackAsync', index);
    }
    /**
     * Sets [MusicItem] at [index] in the queue
     */
    async setTrackAsync(index: number, mi: MusicItem): Promise<void> {
        z.number().nonnegative().parse(index)
        await PS('queue.setTrackAsync', { index, mi });
    }
    /**
     * Index of current track
     */
    async currTrackIdx_getAsync(): Promise<number> {
        return await PS('queue.currTrackIdx_getAsync')
    }

    /**
     * Set index of current track
     */
    async currTrackIdx_setAsync(value: number) {
        z.number().nonnegative().parse(value)
        await PS('queue.currTrackIdx_setAsync', value)
    }
    /**
     * Queue's length
     */
    async lengthAsync(): Promise<number> {
        return await PS('queue.lengthAsync');
    }

    /**
     * Queue's helpers
     */
    helpers = {
        /**
         * Inserts [MusicItem] after current track
         */
        playNextAsync: async (mis: MusicItem[]) => {
            z.array(sMusicItem, { error: () => `Validation failure for: \n${JSON.stringify(mis, null, 2)}\n` }).parse(mis, {
                reportInput: true
            })
            let idx = (await this.currTrackIdx_getAsync()) + 1
            if (idx >= await this.lengthAsync()) {
                await this.addAllAsync(mis)
            } else {
                await this.insertAllAsync(idx, mis)
            }
        },
    }
}

export class DownloadsState {
    _counter = 0
    async download(obj: {
        downloadType: string,
        mi: MusicItem,
        fetch: () => Promise<any>, abort: () => void
    }): Promise<any> {
        let { downloadType, mi, fetch, abort } = obj

        let poolName = `DownloadState_(${this._counter})`
        let pool = MusicPlayer._funcsManager.makePool(poolName)
        pool.addWithId(fetch, 'fetch')
        pool.addWithId(abort, 'abort')

        let val = []
        try {
            console.log(`calling PS register`)
            val = await PS('DownloadsState.download', { downloadType, id: mi.id, text: mi.title, poolName });
            if (!val || val.length === 0) {
                console.log(`bad val:`, val)
            }
        } catch (e) {
            MusicPlayer.logger.error('Error in DownloadsState.download(): ' + e)
            MusicPlayer._funcsManager.deletePool(poolName)
            throw e
        }

        MusicPlayer._funcsManager.deletePool(poolName)
        return val
    }

    async removeAndAbortByTypeAsync(type: string) {
        await PS('DownloadsState.removeAndAbortByTypeAsync', { type });
    }

    async guardDownloadAsync(mi: MusicItem, fn: (bf: any) => Promise<any>) {
        return await this.guardLoadAsync('download', mi, fn,)
    }

    async guardMusicItemLoadingAsync(mi: MusicItem, fn: (bf: any) => Promise<any>) {
        await this.removeAndAbortByTypeAsync('play');
        await MusicPlayer.playback.stopWithAsync(PlayState.loading)
        try {
            return await this.guardLoadAsync('play', mi, fn)
        } catch (e) {
            MusicPlayer.logger.warn('Exception downloading mi: ' + e)
            // if (playState == PlayState.loading) { // Should check?
            await MusicPlayer.playback.stopWithAsync(PlayState.notReady)
            // }
            throw e
        }
    }

    async guardLoadAsync(downloadType: string, mi: MusicItem, fn: (bf: any) => Promise<any>) {
        return await BytesFetcher.run(async (bf) => {
            return await this.download({
                downloadType,
                mi,
                abort: () => { bf.abort() },
                fetch: async () => await fn(bf)
            })
        })
    }
}

/**
 * Store and access any data as json in long-term memory
 */
export class PropertyStorage {
    async getAsync(name: string): Promise<any> {
        z.string().parse(name)
        return await PS('propertyStorage.getAsync', name);
    }
    async setAsync(name: string, value: any) {
        z.string().parse(name)
        await PS('propertyStorage.setAsync', { 'name': name, 'value': value });
    }
}

export class ErrorManager {
    /**
     * Get current error message
     */
    async getAsync(): Promise<string> {
        return await PS('errorManager.getAsync');
    }
    /**
     * Set error message that will be show instead of content.
     * Use empty string to clean error message
     */
    async setAsync(err: string) {
        z.string(err)
        await PS('errorManager.setAsync', err);
    }
}

export class Helpers {
    MusicPage(obj: MusicPageDescrUntyped): MusicPageDescr {
        sMusicPageDescrUntyped.parse(obj)
        return Object.assign({ type: 'music' }, obj) as MusicPageDescr
    }

    ControlsPage(obj: ControlsPageDescrUntyped): ControlsPageDescr {
        sControlsPageDescrUntyped.parse(obj)
        return Object.assign({ type: 'controls' }, obj) as ControlsPageDescr
    }

    makeTracklist(itemlist: MusicItem[]) {
        z.array(sItem).parse(itemlist)
        return {
            listType: 'tracklist' as ListType,
            itemlist: itemlist,
            rowsCount: -1,
        };
    }

    makeGrouplist(itemlist: GroupItem[]) {
        z.array(sItem).parse(itemlist)
        return {
            listType: 'grouplist' as ListType,
            itemlist: itemlist,
            rowsCount: -1,
        };
    }

    defaultDownloadProps(downloadId: string, name: string): DownloadProps {
        z.string().parse(downloadId)
        z.string().parse(name)
        return {
            id: downloadId,
            onDataReceived: (recieved: number, contentLength: number) => {
                z.number().nonnegative().parse(recieved)
                z.number().nonnegative().parse(contentLength)
                downloader.updateAsync(downloadId,
                    `[${(recieved / contentLength * 100).toFixed(2)} %.]. Downloading "${name}"`
                );
            }
        }
    }

    async setAttrsAsync(attrs: KeyValue) {
        let Source = MusicPlayer.source
        // MusicPlayer.logger.blue('>>> Page attrs:', attrs)
        if (attrs.hasOwnProperty('isShowSearch'))
            await Source.isShowSearch_setAsync(attrs.isShowSearch)
        if (attrs.hasOwnProperty('navType'))
            await Source.navType_setAsync(attrs.navType)

        if (attrs.hasOwnProperty('tabs')) {
            if (attrs.navType === NavType.searchTabs) {
                await Source.searchTabs_setAsync(attrs.tabs)
            } else if (attrs.navType === NavType.tabs) {
                await Source.tabs_setAsync(attrs.tabs)
            }
        }
        if (attrs.hasOwnProperty('tabIdx')) {
            if (attrs.navType === NavType.searchTabs) {
                await Source.currSearchTabIdx_setAsync(attrs.tabIdx)
            } else if (attrs.navType === NavType.tabs) {
                await Source.currTabIdx_setAsync(attrs.tabIdx)
            }
        }
    }

    preloader(originalMethod: any, _context: any) {
        async function replacementMethod(this: any, ...args: any[]) {
            await Helpers._setPreloaderAsync(true)
            let res: any
            let err: Error
            try {
                res = await originalMethod.call(this, ...args);
            } catch (e) {
                err = e
            }
            await Helpers._setPreloaderAsync(false)
            if (err) {
                throw err
            }
            return res;
        }
        return replacementMethod;
    }

    static async _setPreloaderAsync(value: boolean) {
        await MusicPlayer.source.isShowPreloader_setAsync(value)
        await MusicPlayer.updateAppStateAsync()
    }

    loading(originalMethod: any, _context: any) {
        async function replacementMethod(this: any, ...args: any[]) {
            await MusicPlayer.playback.stopWithAsync(PlayState.loading)
            let res: any
            try {
                res = await originalMethod.call(this, ...args);
            } catch (e) {
                await MusicPlayer.playback.stopWithAsync(PlayState.notReady)
                throw e
            }
            return res;
        }
        return replacementMethod;
    }
}

export const MusicPlayer = new MusicPlayerClass()


function _checkControls(controls: Control[]) {
    let ids = []
    for (let el of controls) {
        if (!('id' in el)) continue;

        if (ids.includes(el.id)) {
            MusicPlayer.logger.error(`Duplicate id for:`, el)
            throw Error(`Duplicate id: ${el.id}`)
        }
        ids.push(el.id)
    }
}

function _addControlsToPool(controls: Control[], poolName: string) {
    MusicPlayer.logger.log('_addControlsToPool')
    var pool = MusicPlayer._funcsManager.getPool(poolName);
    for (let el of controls) {
        if ('onChanged' in el) {
            pool.addWithId(el.onChanged, el.id)
        }
    }
}

function _addNamesToActionBtns(obj: object) {
    // MusicPlayer.logger.log('_addNamesToActionBtns')

    let namedFuncs = _findPropertyPathsWithValues(obj, 'actionBtn')
    for (let el of namedFuncs) {
        let actionBtn = el.value
        if (!actionBtn) {
            MusicPlayer.logger.log(`Property '${el.path}' is nullish`)
            continue
        }
        if (typeof actionBtn.callback !== "function") {
            MusicPlayer.logger.warn(`Property '${el.path}' not function`)
            continue
        }
        // MusicPlayer.logger.blue(`_callbackName '${el.path}' set`)
        actionBtn._callbackName = el.path
    }
}

function _addActionBtnsToPool(obj: object, poolName: string) {
    // MusicPlayer.logger.log('_addActionBtnsToPool for poolName', poolName)

    var pool = MusicPlayer._funcsManager.getPool(poolName);
    let namedFuncs = _findPropertyPathsWithValues(obj, 'actionBtn')
    for (let el of namedFuncs) {
        let actionBtn = el.value
        if (!actionBtn) {
            MusicPlayer.logger.log(`Property '${el.path}' is nullish`)
            continue
        }
        if (typeof actionBtn.callback !== "function") {
            MusicPlayer.logger.warn(`Property '${el.path}' not function`)
            continue
        }
        // MusicPlayer.logger.blue(`Property '${el.path}' set [${typeof actionBtn.callback}]`)
        pool.addWithId(actionBtn.callback, el.path)
    }
}

function _findPropertyPathsWithValues(obj: object, targetKey: string, currentPath = ''): { path: string, value: any }[] {
    if (obj === null || typeof obj !== 'object') {
        return [];
    }
    let pathsAndValues = [];

    for (let key in obj) {
        const path = currentPath ? `${currentPath}.${key}` : key

        if (key === targetKey) {
            pathsAndValues.push({ path, value: obj[key] })
        }

        // If the value is an array, iterate through its elements
        if (Array.isArray(obj[key])) {
            obj[key].forEach((item, index) => {
                const arrayPath = `${path}[${index}]`
                pathsAndValues = pathsAndValues.concat(
                    _findPropertyPathsWithValues(item, targetKey, arrayPath));
            });
        } else {
            pathsAndValues = pathsAndValues.concat(
                _findPropertyPathsWithValues(obj[key], targetKey, path));
        }
    }

    return pathsAndValues
}
