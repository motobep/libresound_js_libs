import { z } from './zod';
// import { z } from 'zod'
import { NavType, BodyType, ListType, IconName, PlayState, Extension, } from "./enums";

export const sKeyValue = z.record(z.string(), z.any());
export type KeyValue = z.infer<typeof sKeyValue>

export const sNavType = z.enum(NavType);
export const sBodyType = z.enum(BodyType);
export const sListType = z.enum(ListType);
export const sIconName = z.enum(IconName);
export const sPlayState = z.enum(PlayState);
export const sExtension = z.enum(Extension);


export const sTabs = z.array(z.object({
    text: z.string(),
    icon: z.string(),
}))
export type Tabs = z.infer<typeof sTabs>
export const sSearchTabs = z.array(z.string())
export type SearchTabs = z.infer<typeof sSearchTabs>


export const sItemAction = z.object({
    text: z.string(),
    icon: sIconName.optional(),
    callback: z.function({ input: [], output: z.promise(z.void()) })
});
export type ItemAction = z.infer<typeof sItemAction>

export const sItem = z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    thumbnailUrl: z.string().nullish(),
    props: sKeyValue.nullish(),
});
export type Item = z.infer<typeof sItem>

export const sIndexedItem = z.object({
    index: z.number(),
    item: sItem
});
export type IndexedItem = z.infer<typeof sIndexedItem>

export const sMusicItem = sItem.extend({
    id: z.string(),
    title: z.string(),
    subtitle: z.string().nullish(),

    filepath: z.string().nullish(),
    url: z.string().nullish(),
    thumbnailUrl: z.string().nullish(),

    artist: z.object({
        id: z.string().nullish(),
        title: z.string().nullish()
    }).nullish(),
    album: z.object({
        id: z.string().nullish(),
        title: z.string().nullish()
    }).nullish(),
    duration: z.int().optional(),
    extension: sExtension,
    props: sKeyValue.nullish(),
});
export type MusicItem = z.infer<typeof sMusicItem>

export const sGroupItem = sItem.extend({
    id: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    thumbnailUrl: z.string().nullish(),
    props: sKeyValue.nullish(),
});
export type GroupItem = z.infer<typeof sGroupItem>

export const sActionBtnDescr = z.object({
    text: z.string().nullish(),
    icon: sIconName.nullish(),
    callback: z.function({ input: [], output: z.promise(z.void()) })
});
export type ActionBtnDescr = z.infer<typeof sActionBtnDescr>

export const sPageHeaderDescr = z.object({
    title: z.string(),
    subtitle: z.string().nullish(),
    thumbnailUrl: z.string().nullish(),
    actionBtn: sActionBtnDescr.nullish()
});
export type PageHeaderDescr = z.infer<typeof sPageHeaderDescr>

export const sDownloadProps = z.object({
    id: z.string(),
    onDataReceived: z.function({ input: [z.number(), z.number()], output: z.void() })
});
export type DownloadProps = z.infer<typeof sDownloadProps>

export const sSectionHeaderDescr = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    actionBtn: sActionBtnDescr.nullish()
});
export type SectionHeaderDescr = z.infer<typeof sSectionDescr>

export const sSectionDescr = z.object({
    listType: sListType,
    itemlist: z.union([z.array(sMusicItem), z.array(sGroupItem)]),
    rowsCount: z.number(),
    header: sSectionHeaderDescr.optional(),
    isBigTile: z.boolean().optional(),
    props: sKeyValue.optional()
});
export type SectionDescr = z.infer<typeof sSectionDescr>


export const sTextInput = z.object({
    id: z.string(),
    type: z.enum(['textInput']),
    initial: z.string().nullish(),
    hintText: z.string().nullish(),
    label: z.string().optional(),
    maxWidth: z.number().nonnegative().nullish(),
    isWithCopy: z.boolean().nullish(),
    onChanged: z.function({ input: [z.string()], output: z.void() }).nullish(),
});
export type TextInput = z.infer<typeof sTextInput>

export const sSelectInput = z.object({
    id: z.string(),
    type: z.enum(['selectInput']),
    initial: z.string(),
    elements: z.array(z.tuple([z.string(), z.string()])),
    onChanged: z.function({ input: [z.string()], output: z.void() }).nullish(),
});
export type SelectInput = z.infer<typeof sSelectInput>

export const sRadioGroupInput = z.object({
    id: z.string(),
    type: z.enum(['radioGroupInput']),
    initial: z.string(),
    elements: z.array(z.tuple([z.string(), z.string()])),
    onChanged: z.function({ input: [z.string()], output: z.void() }).nullish(),
});
export type RadioGroupInput = z.infer<typeof sRadioGroupInput>

export const sCheckboxInput = z.object({
    id: z.string(),
    type: z.enum(['checkboxInput', 'switchInput']),
    initial: z.boolean(),
    text: z.string().nullish(),
    onChanged: z.function({ input: [z.boolean()], output: z.void() }).nullish(),
});
export type CheckboxInput = z.infer<typeof sCheckboxInput>

export const sButtonInput = z.object({
    id: z.string(),
    type: z.enum(['buttonInput']),
    text: z.string().nullish(),
    onTap: z.function({ input: [], output: z.void() }).nullish(),
});
export type ButtonInput = z.infer<typeof sButtonInput>


export const sInput = z.union([
    sTextInput, sSelectInput, sRadioGroupInput, sCheckboxInput, sButtonInput])
export type Input = z.infer<typeof sInput>


export const sText = z.object({
    type: z.enum(['text']),
    text: z.string(),
    fontSize: z.number().nonnegative().nullish(),
});
export type Text = z.infer<typeof sText>

export const sSpace = z.object({
    type: z.enum(['space']),
    height: z.number().nonnegative().nullish(),
    width: z.number().nonnegative().nullish(),
});
export type Space = z.infer<typeof sSpace>

export const sControl = z.union([sInput, sText, sSpace])
export type Control = z.infer<typeof sControl>


export const sTabsNav = z.object({
    type: sNavType.optional(),
    tabs: z.union([sTabs, sSearchTabs]).optional(),
    index: z.number().nonnegative().optional(),
});
export type TabsNav = z.infer<typeof sTabsNav>
export const sAttrs = z.object({
    isShowSearch: z.boolean().optional(),
    tabsNav: sTabsNav.optional(),
});
export type Attrs = z.infer<typeof sAttrs>

export const sMusicPageDescr = z.object({
    type: z.enum(['music']),
    sectionlist: z.array(sSectionDescr),
    title: z.string().optional(),
    header: sPageHeaderDescr.optional(),
    actionBtn: sActionBtnDescr.nullish(),
    attrs: sAttrs.nullish(),
    props: sKeyValue.optional(),
});
export type MusicPageDescr = z.infer<typeof sMusicPageDescr>

export const sMusicPageDescrUntyped = sMusicPageDescr.omit({ 'type': true })
export type MusicPageDescrUntyped = z.infer<typeof sMusicPageDescrUntyped>


export const sControlsPageDescr = z.object({
    type: z.enum(['controls']),
    title: z.string().optional(),
    controls: z.array(sControl),
    attrs: sAttrs.nullish(),
    props: sKeyValue.optional()
});
export type ControlsPageDescr = z.infer<typeof sControlsPageDescr>

export const sControlsPageDescrUntyped = sControlsPageDescr.omit({ 'type': true })
export type ControlsPageDescrUntyped = z.infer<typeof sControlsPageDescrUntyped>

export const sWebViewPageDescr = z.object({
    type: z.enum(['webView']),
    title: z.string().optional(),
    url: z.string(),
    attrs: sAttrs.nullish(),
    props: sKeyValue.optional()
});
export type WebViewPageDescr = z.infer<typeof sWebViewPageDescr>

export const sWebViewPageDescrUntyped = sWebViewPageDescr.omit({ 'type': true })
export type WebViewPageDescrUntyped = z.infer<typeof sWebViewPageDescrUntyped>


export const sPageDescr = z.union([sMusicPageDescr, sControlsPageDescr, sWebViewPageDescr])
/**
 * Use props.attrs to set page attributes
 * Use props.funcs to save your functions in PageDescr
 *  and access them after deserialization
 */
export type PageDescr = z.infer<typeof sPageDescr>

/**
 * If synced lyrics use LRC for LyricsData.text,
 * if not use plain text for LyricsData.text
 */
export type LyricsData = {
    text: string,
    isSynced: boolean,
    descr: string,
}
