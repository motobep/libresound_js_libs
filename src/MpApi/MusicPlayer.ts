import { z } from 'zod';

import { ListType, NavType, PlayState, RightControlsType } from './enums'
import { ActionBtnDescr, Control, DownloadProps, ItemAction, KeyValue, MusicItem, PageHeaderDescr, sActionBtnDescr, sControl, SectionDescr, sItem, sItemAction, sKeyValue, sMusicItem, sNavType, sPageHeaderDescr, sSectionDescr, MusicPageDescr, ControlsPageDescr, sMusicPageDescrUntyped, MusicPageDescrUntyped, ControlsPageDescrUntyped, sControlsPageDescrUntyped, PageDescr, sPageDescr, GroupItem, sPlayState, Item, sTabs, sSearchTabs, Tabs, Attrs, SearchTabs, sAttrs } from './types'
import { Downloader } from './Downloader';
import { Runtime, SendMessageType, BytesFetcher } from '@runtime/Runtime'
import { PoolsManager } from './runtime/internal/PoolsManager';
import { Logger } from '@runtime/Logger'
import { testAllPS } from './testAllPS';
import { WebView } from './WebView';


export declare const __dartjs_sendMessage: SendMessageType


export function PS(a: string, b: any = null) {
    return __dartjs_sendMessage(`PS.${a}`, JSON.stringify(b));
}

/**
 * The class to interact with the app
 */
export class MusicPlayer {
    runtime = new Runtime()
    source = new Source()
    playback = new Playback()
    queue = new Queue()
    downloader = new Downloader()
    downloadsState = new DownloadsState()
    propertyStorage = new PropertyStorage()
    helpers = new Helpers()
    webView = new WebView()
    logger = new Logger('🔌MusicPlayer: ')
    settings = {
        logger: new Logger('🔌settings '),
        async setControlsAsync(controls: Control[]) {
            z.array(sControl).parse(controls)
            _checkControls(controls)

            const controlsPool = 'controlsPool'
            if (musicPlayer._poolManager.contains(controlsPool)) {
                musicPlayer._poolManager.deletePool(controlsPool);
            }
            musicPlayer._poolManager.makePool(controlsPool);
            _addControlsToPool(controls, controlsPool)

            await PS('settings.setControlsAsync', controls);
        },
    }

    _poolManager = new PoolsManager()
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
    async cachedMiExistsAsync(mi: MusicItem): Promise<boolean> {
        return await PS('cachedMiExistsAsync', { mi });
    }
    /** 
     * Returns string if errored
     * null - if not
    */
    async saveCachedMiAsync(mi: MusicItem): Promise<string | 'INVALID_SOURCE_DIR' | null> {
        return await PS('saveCachedMiAsync', { mi });
    }

    /** 
     * Returns string if errored
     * null - if not
    */
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

    // NOTICE: Funcs pool for a page created/deleted automatically in dart
    async initPageStacksAsync(stacksNames: string[]): Promise<void> {
        z.array(z.string()).parse(stacksNames)
        await PS('initPageStacksAsync', stacksNames);
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

    eventListeners = {}
    /**
     * scrollEnd:
     *   args: scorllExtents: KeyValue
     */
    async addEventListenerAsync(type: 'scrollEnd', listener: (...args: any) => void) {
        switch (type) {
            case 'scrollEnd':
                this.eventListeners[type] = listener
                await PS('source.addEventListener_scrollEnd');
                break
        }
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
        let page = await PS('currPageStack.last_getAsync');
        let currPageId = await _getCurrPageIdAsync()
        _addFuncs(currPageId, page)
        return page
    }
    // NOTICE: Funcs pool for a page created/deleted automatically in dart
    async last_setAsync(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr, { reportInput: true })
        musicPlayer.logger.blue('last_setAsync')
        await CurrPageStack._onBeforePageCreate(pageDescr)
        await PS('currPageStack.last_setAsync', pageDescr);
        await CurrPageStack._onPageCreate(pageDescr)
    }
    // NOTICE: Funcs pool for a page created/deleted automatically in dart
    async pushAsync(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr, { reportInput: true })
        // musicPlayer.logger.log('pushAsync')
        await CurrPageStack._onBeforePageCreate(pageDescr)
        await PS('currPageStack.pushAsync', pageDescr);
        await CurrPageStack._onPageCreate(pageDescr)
    }

    static async _onBeforePageCreate(page: PageDescr) {
        if (page.type === 'music') {
            _addNamesToActionBtns((page as MusicPageDescr))
        }
    }
    static async _onPageCreate(page: PageDescr) {
        let currPageId = await _getCurrPageIdAsync()
        if (await _getCurrPageTypeAsync() === 'music') {
            _addActionBtnsToPool((page as MusicPageDescr), currPageId)
        }
        if (await _getCurrPageTypeAsync() === 'controls') {
            _addControlsToPool((page as ControlsPageDescr).controls, currPageId)
        }
        if (page.props?.funcs) {
            _saveFuncs(currPageId, page.props.funcs)
        }
    }

    // NOTICE: Funcs pool for a page created/deleted automatically in dart
    async popAsync(): Promise<boolean> {
        musicPlayer.logger.blue('popAsync')
        return await PS('currPageStack.popAsync');
    }
}

function _addFuncs(poolId: string, page: PageDescr) {
    musicPlayer.logger.debug('_addFuncs')
    var pool = musicPlayer._poolManager.getPool(poolId);
    var funcs = pool.get('page_props_funcs')
    if (funcs) {
        page.props = { ...page.props, funcs, }
    }
}

function _saveFuncs(poolId: string, funcs: {
    [x: string]: (...args: any) => any;
}) {
    musicPlayer.logger.debug('_saveFuncs')
    var pool = musicPlayer._poolManager.getPool(poolId);
    pool.addWithId('page_props_funcs', funcs)
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

    async sectionlist_getAsync(): Promise<SectionDescr[]> {
        return await PS('currMusicPage.sectionlist_getAsync')
    }

    async sectionlist_setAsync(value: SectionDescr[]) {
        z.array(sSectionDescr).parse(value, { reportInput: true })

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

    async attrs_getAsync(): Promise<Attrs | null> {
        return await PS('currMusicPage.attrs_getAsync')
    }

    async props_getAsync(): Promise<KeyValue> {
        let props = await PS('currMusicPage.props_getAsync')
        let currPageId = await _getCurrPageIdAsync()
        _addFuncs(currPageId, props)
        return props
    }

    async props_setAsync(props: KeyValue) {
        sKeyValue.parse(props)
        let currPageId = await _getCurrPageIdAsync()
        if (props?.funcs) {
            _saveFuncs(currPageId, props.funcs)
        }
        await PS('currMusicPage.props_setAsync', props)
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
    /**
     * Play track by [index] from Queue
     */
    async playByIdxAsync(index: number) {
        z.number().nonnegative().parse(index)
        await PS('playback.playByIdx', index);
    }

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

    eventListeners = {}
    async addEventListenerAsync(type: 'counterUpdate', listener: (...args: any) => void) {
        switch (type) {
            case 'counterUpdate':
                this.eventListeners[type] = listener
                await PS('playback.addEventListener_counterUpdate');
                break
        }
    }
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

    async canAutoplayAsync(): Promise<boolean> {
        return await PS('queue.canAutoplayAsync')
    }

    async setAutoplayAsync(b: boolean): Promise<void> {
        await PS('queue.setAutoplayAsync', b)
    }

    eventListeners = {}
    /**
     * musicItemChange:
     *   args: index - index of current track in queue, -1 if no item
     */
    async addEventListenerAsync(type: 'musicItemChange', listener: (...args: any) => void) {
        switch (type) {
            case 'musicItemChange':
                this.eventListeners[type] = listener
                await PS('queue.addEventListener_musicItemChange');
                break
        }
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
        let pool = musicPlayer._poolManager.makePool(poolName)
        pool.addWithId('fetch', fetch)
        pool.addWithId('abort', abort)

        let val = []
        try {
            console.log(`calling PS register`)
            val = await PS('DownloadsState.download', { downloadType, id: mi.id, text: mi.title, poolName });
            if (!val || val.length === 0) {
                console.log(`bad val:`, val)
            }
        } catch (e) {
            musicPlayer.logger.error('Error in DownloadsState.download(): ' + e)
            throw e
        } finally {
            musicPlayer._poolManager.deletePool(poolName)
        }

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
        await musicPlayer.playback.stopWithAsync(PlayState.loading)
        try {
            return await this.guardLoadAsync('play', mi, fn)
        } catch (e) {
            musicPlayer.logger.warn('Exception downloading mi: ' + e)
            // if (playState == PlayState.loading) { // Should check?
            await musicPlayer.playback.stopWithAsync(PlayState.notReady)
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
                musicPlayer.downloader.updateAsync(downloadId,
                    `[${(recieved / contentLength * 100).toFixed(2)} %.]. Downloading "${name}"`
                );
            }
        }
    }

    async setAttrsAsync(attrs: Attrs) {
        if (!attrs) {
            musicPlayer.logger.error('nullish attrs:', attrs)
            return
        }
        sAttrs.parse(attrs, { reportInput: true })
        await PS('helpers.setAttrsAsync', attrs)
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
        await musicPlayer.source.isShowPreloader_setAsync(value)
        await musicPlayer.updateAppStateAsync()
    }

    loading(originalMethod: any, _context: any) {
        async function replacementMethod(this: any, ...args: any[]) {
            await musicPlayer.playback.stopWithAsync(PlayState.loading)
            let res: any
            try {
                res = await originalMethod.call(this, ...args);
            } catch (e) {
                await musicPlayer.playback.stopWithAsync(PlayState.notReady)
                throw e
            }
            return res;
        }
        return replacementMethod;
    }
}

export const musicPlayer = new MusicPlayer()


function _checkControls(controls: Control[]) {
    let ids = []
    for (let el of controls) {
        if (!('id' in el)) continue;

        if (ids.includes(el.id)) {
            musicPlayer.logger.error(`Duplicate id for:`, el)
            throw Error(`Duplicate id: ${el.id}`)
        }
        ids.push(el.id)
    }
}

function _addControlsToPool(controls: Control[], poolName: string) {
    musicPlayer.logger.blue('_addControlsToPool')
    var pool = musicPlayer._poolManager.getPool(poolName);
    for (let el of controls) {
        if ('onChanged' in el) {
            pool.addWithId(el.id, el.onChanged)
        }
        if ('onTap' in el) {
            pool.addWithId(el.id, el.onTap)
        }
    }
}

function _addNamesToActionBtns(obj: object) {
    // musicPlayer.logger.log('_addNamesToActionBtns')

    let namedFuncs = _findPropertyPathsWithValues(obj, 'actionBtn')
    for (let el of namedFuncs) {
        let actionBtn = el.value
        if (!actionBtn) {
            musicPlayer.logger.log(`Property '${el.path}' is nullish`)
            continue
        }
        if (typeof actionBtn.callback !== "function") {
            musicPlayer.logger.warn(`Property '${el.path}' not function`)
            continue
        }
        // musicPlayer.logger.blue(`_callbackName '${el.path}' set`)
        actionBtn._callbackName = el.path
    }
}

function _addActionBtnsToPool(obj: object, poolName: string) {
    // musicPlayer.logger.log('_addActionBtnsToPool for poolName', poolName)

    var pool = musicPlayer._poolManager.getPool(poolName);
    let namedFuncs = _findPropertyPathsWithValues(obj, 'actionBtn')
    for (let el of namedFuncs) {
        let actionBtn = el.value
        if (!actionBtn) {
            musicPlayer.logger.log(`Property '${el.path}' is nullish`)
            continue
        }
        if (typeof actionBtn.callback !== "function") {
            musicPlayer.logger.warn(`Property '${el.path}' not function`)
            continue
        }
        // musicPlayer.logger.blue(`Property '${el.path}' set [${typeof actionBtn.callback}]`)
        pool.addWithId(el.path, actionBtn.callback)
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
