import { z } from 'zod';

import { ListType, NavType } from './enums'
import { ActionBtnDescr, Control, DownloadProps, Item, ItemAction, KeyValue, MusicItem, PageHeaderDescr, sActionBtnDescr, sControl, SectionDescr, sItem, sItemAction, sKeyValue, sMusicItem, sNavType, sPageHeaderDescr, sSectionDescr, MusicPageDescr, ControlsPageDescr, sMusicPageDescrUntyped, MusicPageDescrUntyped, ControlsPageDescrUntyped, sControlsPageDescrUntyped, PageDescr, sPageDescr } from './types'
import { downloader } from './Downloader';
import { Runtime, sendMessage } from './Runtime'
import { FuncsManager } from './internal/FuncsManager';
import { Logger } from './Logger'


/**
 * The class to interact with the app
 */
export class MusicPlayerClass {
    runtime = new Runtime()
    source = new Source()
    playback = new Playback()
    queue = new Queue()
    downloader = downloader
    propertyStorage = new PropertyStorage()
    helpers = new Helpers()
    logger = new Logger('🔌')
    settings = {
        logger: new Logger('🔌settings'),
        setControls(controls: Control[]) {
            z.array(sControl).parse(controls)
            _checkControls(controls)

            const controlsPool = 'controlsPool'
            if (MusicPlayer._funcsManager.contains(controlsPool)) {
                MusicPlayer._funcsManager.deletePool(controlsPool);
            }
            MusicPlayer._funcsManager.makePool(controlsPool);
            _addControlsToPool(controls, controlsPool)

            sendMessage('PS.settings.setControls', JSON.stringify(controls));
        },
    }

    _funcsManager = new FuncsManager()

    /**
     * Get currently used language
     */
    getLanguage(): string {
        return sendMessage('PS.getLanguage', JSON.stringify({}));
    }

    downloadMusicItemAsync(mi: MusicItem): Promise<void> {
        sMusicItem.parse(mi)
        return sendMessage('PS.downloadMusicItemAsync', JSON.stringify(mi));
    }

    /**
     * Opens this plugin's source
     */
    toThisSourceAsync(): Promise<void> {
        return sendMessage('PS.toThisSourceAsync', JSON.stringify({}));
    }

    /**
     * Shows actions dialog
     */
    showActionsDialog(actions: ItemAction[], tapPos: number[] | null = null): void {
        z.array(sItemAction).parse(actions)
        z.nullable(z.array(z.number()))
        this._actions = actions
        sendMessage('PS.showActionsDialog', JSON.stringify({ tapPos }));
    }

    /**
     * Closes actions dialog
     */
    closeActionsDialog(): void {
        sendMessage('PS.closeActionsDialog', JSON.stringify({}));
    }

    _actions: any

    /**
     * Updates app state.
     * Use this method to update UI after changing app state.
     */
    updateAppState() {
        sendMessage('PS.updateAppState', JSON.stringify({}));
    }
}

/**
 * App's Source
 */
export class Source {
    currPageStack = new CurrPageStack()
    currMusicPage = new CurrMusicPage()
    errorManager = new ErrorManager()

    initPageStacks(map: {
        [name: string]: PageDescr[]
    }): void {
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

        sendMessage('PS.initPageStacks', JSON.stringify(map));
    }

    get currPageStackName(): string {
        return sendMessage('PS.currPageStackName-get', JSON.stringify({}));
    }
    set currPageStackName(name: string) {
        z.string().parse(name)
        sendMessage('PS.currPageStackName-set', JSON.stringify(name));
    }

    get currTabIdx(): number {
        return sendMessage('PS.currTabIdx-get', JSON.stringify({}));
    }
    set currTabIdx(index: number) {
        z.number().nonnegative().parse(index)
        sendMessage('PS.currTabIdx-set', JSON.stringify(index));
    }
    getTabs(): string[][] {
        return sendMessage('PS.getTabs', JSON.stringify({}));
    }
    setTabs(arr: string[][]): void {
        z.array(z.array(z.string())).parse(arr)
        sendMessage('PS.setTabs', JSON.stringify(arr));
    }

    get currSearchTabIdx(): number {
        return sendMessage('PS.currSearchTabIdx-get', JSON.stringify({}));
    }
    set currSearchTabIdx(index: number) {
        z.number().nonnegative().parse(index)
        sendMessage('PS.currSearchTabIdx-set', JSON.stringify(index));
    }
    getSearchTabs(): string[] {
        return sendMessage('PS.getSearchTabs', JSON.stringify({}));
    }
    setSearchTabs(arr: string[]): void {
        z.array(z.string()).parse(arr)
        sendMessage('PS.setSearchTabs', JSON.stringify(arr));
    }

    get navType() {
        return sendMessage('PS.navType-get', JSON.stringify({}));
    }
    set navType(navType: NavType) {
        sNavType.parse(navType)
        sendMessage('PS.navType-set', JSON.stringify(navType));
    }

    get isShowPreloader() {
        return sendMessage('PS.isShowPreloader-get', JSON.stringify({}));
    }
    set isShowPreloader(isShow: boolean) {
        z.boolean().parse(isShow)
        sendMessage('PS.isShowPreloader-set', JSON.stringify(isShow));
    }

    get isShowSearch() {
        return sendMessage('PS.isShowSearch-get', JSON.stringify({}));
    }
    set isShowSearch(isShow: boolean) {
        z.boolean().parse(isShow)
        sendMessage('PS.isShowSearch-set', JSON.stringify(isShow));
    }

    /* get rightControls() {
        return sendMessage('PS.rightControls-set', JSON.stringify({}));
    }
    set rightControls(controls: string[]) {
        z.array(z.string()).parse(controls)
        sendMessage('PS.rightControls-set', JSON.stringify(controls));
    } */

    async updateThumbnailFromUrlAsync(id: string, url: string): Promise<boolean> {
        z.string().parse(id)
        z.string().parse(url)
        return await sendMessage('PS.updateThumbnailFromUrlAsync',
            JSON.stringify({ id: id, url: url }));
    }
}

/**
 * Current Page Stack.
 */
export class CurrPageStack {
    get length(): number {
        return sendMessage('PS.currPageStack.length-get', JSON.stringify({}));
    }
    get last(): PageDescr {
        return sendMessage('PS.currPageStack.last-get', JSON.stringify({}));
    }
    setLast(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr)
        MusicPlayer.logger.log('setLast')

        if (_getCurrPageType() === 'controls') {
            MusicPlayer._funcsManager.deletePool(_getCurrPageId());
        }

        sendMessage('PS.currPageStack.setLast', JSON.stringify(pageDescr));

        if (_getCurrPageType() === 'controls') {
            let currPageId = _getCurrPageId()
            MusicPlayer._funcsManager.makePool(currPageId);
            _addControlsToPool((pageDescr as ControlsPageDescr).controls, currPageId)
        }
    }
    push(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr)
        MusicPlayer.logger.log('push')

        sendMessage('PS.currPageStack.push', JSON.stringify(pageDescr));

        if (_getCurrPageType() === 'controls') {
            let currPageId = _getCurrPageId()
            MusicPlayer._funcsManager.makePool(currPageId);
            _addControlsToPool((pageDescr as ControlsPageDescr).controls, currPageId)
        }
    }
    pop(): boolean {
        if (_getCurrPageType() === 'controls') {
            MusicPlayer._funcsManager.deletePool(_getCurrPageId());
        }

        return sendMessage('PS.currPageStack.pop', JSON.stringify({}));
    }
}

function _getCurrPageId(): string {
    return sendMessage('PS.currPageId', JSON.stringify({}));
}
function _getCurrPageType(): string {
    return sendMessage('PS.currPage.type', JSON.stringify({}));
}

/**
 * Current Music Page.
 * Don't use it if current page is not a Music Page
 */
export class CurrMusicPage {
    get title() {
        return sendMessage('PS.currMusicPage.title-get', JSON.stringify({}));
    }

    set title(str: string) {
        z.string().parse(str)
        sendMessage('PS.currMusicPage.title.set', JSON.stringify(str));
    }

    get sectionlist(): SectionDescr[] {
        return sendMessage('PS.currMusicPage.sectionlist-get', JSON.stringify({}))
    }

    set sectionlist(val: SectionDescr[]) {
        z.array(sSectionDescr).parse(val)
        sendMessage('PS.currMusicPage.sectionlist-set', JSON.stringify(val))
    }

    get header(): PageHeaderDescr {
        return sendMessage('PS.currMusicPage.header-get', JSON.stringify({}))
    }

    set header(val: PageHeaderDescr) {
        sPageHeaderDescr.parse(val)
        sendMessage('PS.currMusicPage.header-set', JSON.stringify(val))
    }

    get actionBtn(): ActionBtnDescr {
        return sendMessage('PS.currMusicPage.actionBtn-get', JSON.stringify({}))
    }

    set actionBtn(val: ActionBtnDescr) {
        sActionBtnDescr.parse(val)
        sendMessage('PS.currMusicPage.actionBtn-set', JSON.stringify(val))
    }

    get props() {
        return sendMessage('PS.currPage.props-get', JSON.stringify({}));
    }

    set props(props: KeyValue) {
        sKeyValue.parse(props)
        sendMessage('PS.currPage.props-set', JSON.stringify(props));
    }
}

/**
 * App's Playback
 */
export class Playback {
    /**
     * Play track by [index] from Queue
     */
    playByIdx(index: number): void {
        z.number().nonnegative().parse(index)
        sendMessage('PS.playback.playByIdx', JSON.stringify(index));
    }
}

/**
 * App's Queue
 */
export class Queue {
    /**
     * Inserts [list] at [index] in the queue
     */
    insertAll(index: number, list: MusicItem[]): void {
        z.number().nonnegative().parse(index)
        z.array(sMusicItem).parse(list)
        sendMessage('PS.queue.insertAll', JSON.stringify({ index: index, list: list }));
    }
    /**
     * Adds [list] at the end of the queue
     */
    addAll(list: MusicItem[]): void {
        z.array(sMusicItem).parse(list)
        sendMessage('PS.queue.addAll', JSON.stringify(list));
    }
    /**
     * Removes a range of elements from the queue.
     * Removes the elements with positions greater than or equal to [start]
     * and less than [end], from the queue.
    */
    removeRange(start: number, end: number): void {
        z.number().nonnegative().parse(start)
        z.number().nonnegative().parse(end)
        sendMessage('PS.queue.removeRange', JSON.stringify({ start: start, end: end }));
    }
    /**
     * Removes items before and after the current track.
     * Only this track will remain
     */
    clear(): void {
        sendMessage('PS.queue.clear', JSON.stringify({}));
    }
    /**
     * Returns [MusicItem] by [index] from the queue
     */
    getTrack(index: number): MusicItem {
        z.number().nonnegative().parse(index)
        return sendMessage('PS.queue.getTrack', JSON.stringify(index));
    }
    /**
     * Index of current track
     */
    get currTrackIdx(): number {
        return sendMessage('PS.queue.currTrackIdx-get', JSON.stringify({}));
    }
    /**
     * Set index of current track
     */
    set currTrackIdx(index: number) {
        z.number().nonnegative().parse(index)
        sendMessage('PS.queue.currTrackIdx-set', JSON.stringify(index));
    }
    /**
     * Queue's length
     */
    get length(): number {
        return sendMessage('PS.queue.length-get', JSON.stringify({}));
    }

    /**
     * Queue's helpers
     */
    helpers = {
        /**
         * Inserts [MusicItem] after current track
         */
        playNext: (mis: MusicItem[]) => {
            z.array(sMusicItem).parse(mis)
            let idx = this.currTrackIdx + 1
            if (idx >= this.length) {
                this.addAll(mis)
            } else {
                this.insertAll(idx, mis)
            }
        },
    }
}

/**
 * Store and access any data as json in long-term memory
 */
export class PropertyStorage {
    get(name: string): any {
        z.string().parse(name)
        return sendMessage('PS.propertyStorage.get', JSON.stringify(name));
    }
    set(name: string, value: any) {
        z.string().parse(name)
        sendMessage('PS.propertyStorage.set', JSON.stringify({ 'name': name, 'value': value }));
    }
}

export class ErrorManager {
    /**
     * Get current error message
     */
    get(): string {
        return sendMessage('PS.errorManager.get', JSON.stringify({}));
    }
    /**
     * Set error message that will be show instead of content.
     * Use empty string to clean error message
     */
    set(err: string) {
        z.string(err)
        sendMessage('PS.errorManager.set', JSON.stringify(err));
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

    makeTracklist(itemlist: Item[]) {
        z.array(sItem).parse(itemlist)
        return {
            listType: 'tracklist' as ListType,
            itemlist: itemlist,
            rowsCount: -1,
        };
    }

    makeGrouplist(itemlist: Item[]) {
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
                downloader.update(downloadId,
                    `[${(recieved / contentLength * 100).toFixed(2)} %.]. Downloading "${name}"`
                );
            }
        }
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
