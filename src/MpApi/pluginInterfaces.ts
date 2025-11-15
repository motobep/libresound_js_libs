import { GroupItem, IndexedItem, ItemAction, MusicItem } from './types'

/**
 * Must be implemented by source plugins ("type": "js:source")
 */
export interface SourcePlugin {
    afterInitAsync(): Promise<void>
    reloadAsync(): Promise<void>

    chooseSourceAsync(): Promise<void>

    getSuggestionsAsync(text: string): Promise<string[]>
    searchAsync(text: string): Promise<void>

    chooseTabAsync(index: number): Promise<void>
    chooseSearchTabAsync(index: number): Promise<void>

    chooseGroupAsync(group: GroupItem): Promise<void>

    buildActionsAsync(indexedItem: IndexedItem, sectionIndex: number): Promise<ItemAction[]>
    buildMultiActionsAsync(indexedItemsMap: { [key: string]: IndexedItem[] }): Promise<ItemAction[]>

    back(): boolean
    canBack(): boolean

    fetchBytesAsync(mi: MusicItem, downloadId: string): Promise<number[]>
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
