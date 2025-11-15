import { GroupItem, IndexedItem, ItemAction, MusicItem } from './types'

/**
 * Must be implemented by source plugins ("type": "js:source")
 */
export interface SourcePlugin {
    /**
     * Called after this plugin was loaded
     */
    afterInitAsync(): Promise<void>
    /**
     * Called when user reloads page
     */
    reloadAsync(): Promise<void>

    /**
     * On choose this plugin's source
     */
    chooseSourceAsync(): Promise<void>

    /**
     * Called when user types in search bar
     */
    getSuggestionsAsync(text: string): Promise<string[]>
    /**
     * On search
     */
    searchAsync(text: string): Promise<void>

    /**
     * On choose tab
     */
    chooseTabAsync(index: number): Promise<void>
    /**
     * On choose search tab
     */
    chooseSearchTabAsync(index: number): Promise<void>

    /**
     * On choose (tap/click) group
     */
    chooseGroupAsync(group: GroupItem): Promise<void>

    /**
     * Called when showing action of an item
     */
    buildActionsAsync(indexedItem: IndexedItem, sectionIndex: number): Promise<ItemAction[]>
    /**
     * Called when showing actions of multiple items
     */
    buildMultiActionsAsync(indexedItemsMap: { [key: string]: IndexedItem[] }): Promise<ItemAction[]>

    /**
     * Called when user taps back button
     */
    back(): boolean
    /**
     * Return value shows whether this source can go back.
     * If it returns true then app will call [back()] method
     */
    canBack(): boolean

    /**
     * Returns bytes to be player by App's player
     */
    fetchBytesAsync(mi: MusicItem, downloadId: string): Promise<number[]>
    /**
     * Returns url to be player by App's player
     */
    fetchUrlAsync(mi: MusicItem, downloadId: string): Promise<String>
}

/**
 * Optional events
 */
export interface OptionalEventHandlers {
    onPlaybackControlsOpen(obj: any): void
    onOpenedPlaybackPlayPrev(obj: any): void
    onOpenedPlaybackPlayNext(obj: any): void
    onBeforeFetch(obj: any): void
    onTapArtistTitle(args: any): void
}

/**
 * Events on plugin's settings page
 */
export interface Settings {
    settings: {
        onOpen(): void
        onClose(): void
    }
}
