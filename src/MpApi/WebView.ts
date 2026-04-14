import { PS } from './MusicPlayer';
import { z } from 'zod';
import { Logger } from '@runtime/Logger';

function WV(a: string, b: any = null) {
    return PS(`WebView.${a}`, b)
}

/**
 * WebView for some platforms (Android)
 */
export class WebView {
    listeners: WebViewListeners = {}

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
