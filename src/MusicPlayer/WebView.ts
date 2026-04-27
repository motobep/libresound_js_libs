import { PS } from './MusicPlayer';
import { z } from './zod';
import { Logger } from '@runtime/Logger';

function WV(a: string, b: any = null) {
    return PS(`WebView.${a}`, b)
}

/**
 * WebView for some platforms (Android)
 */
export class WebView {
    listeners: WebViewListeners = {}
    cookieManager: CookieManager = new CookieManager()

    async isSupportedAsync() {
        return await WV('isSupportedAsync')
    }

    async runJavaScriptReturningResultAsync(code: string) {
        return await WV('runJavaScriptReturningResultAsync', code)
    }
    async currentUrlAsync() {
        return await WV('currentUrlAsync')
    }
    async isNullAsync() {

        z.string().parse('')
        this.logger.log('isNullAsync')
        return await WV('isNullAsync')
    }
    logger = new Logger('🔌 WebView:')
}

class CookieManager {
    async clearCookiesAsync() {
        await WV('cookieManager.clearCookiesAsync')
    }
    async hasCookiesAsync(_): Promise<boolean> {
        return await WV('cookieManager.hasCookiesAsync')
    }
    async getCookiesAsync(url: string): Promise<Cookie[]> {
        return await WV('cookieManager.getCookiesAsync', url)
    }
    async setCookiesAsync(cookies: Cookie[], origin: string | null | undefined = undefined) {
        await WV('cookieManager.setCookiesAsync', { cookies, origin })
    }
}

export type Cookie = {
    name: string
    value: string
    path?: string
    domain?: string
    secure?: boolean
    httpOnly?: boolean
    expiresMs?: number
    maxAge?: number
}

export type WebViewListeners = {
    onPageStarted?: (url: string) => void,
    onProgress?: (int: string) => void,
    onPageFinished?: (url: string) => void,
    onUrlChange?: (urlChange: { url: string }) => void,
    onNavigationRequest?: (navigationRequest: { url: string, isMainFrame: boolean }) => void,
    onHttpAuthRequest?: () => void,
    onHttpError?: () => void,
    onWebResourceError?: () => void,
    onSslAuthError?: () => void,
}
