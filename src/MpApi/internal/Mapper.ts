import { Fs } from '@MpApi/Fs'
import { resolveSourceMap } from '@MpApi/internal/resolveSourceMap'

type SourceMapTrace = {
    at: string,
    fileDst: string,
    lineDst: number,
    fileSrc?: string,
    lineSrc?: number,
    col: 0,
}


export class Mapper {
    async mapStacktraceAsync(stacktrace: string) {
        let traces = this._getTraces(stacktrace)
        return await this._modifyTraces(traces)
    }

    async _modifyTraces(traces: (string | SourceMapTrace)[]): Promise<string> {
        let stacktrace = ''
        for (var el of traces) {
            if (typeof el === 'string') {
                stacktrace += el + '\n'
                continue
            }
            let t: SourceMapTrace = el

            const mapPath = t.fileDst + '.map'
            const fs = new Fs();
            if (fs.existsSync(mapPath)) {
                let pluginSourceMap: string
                if (mapPath.startsWith('assets/libresound_js_libs')) {
                    pluginSourceMap = await fs.mpReadAsset(mapPath);
                } else {
                    pluginSourceMap = fs.readFileSync(mapPath, 'utf8');
                }
                let res = resolveSourceMap(pluginSourceMap, t.lineDst)
                if (res !== null) {
                    t = { ...t, ...res }
                }
            }
            stacktrace += this._traceToStr(t) + '\n'
        }
        return stacktrace
    }

    _traceToStr(t: SourceMapTrace) {
        let srcStr = t.fileSrc ? ` [${t.fileSrc}:${t.lineSrc}]` : ''
        return `    at ${t.at} (${t.fileDst}:${t.lineDst})${srcStr}`
    }

    _getTraces(str: string): (string | SourceMapTrace)[] {
        var arr = str.split('\n')
        var traces = []
        for (var s of arr) {
            var trace: string | Object = s
            var o = this._getTrace(s)
            if (o !== null) {
                trace = o
            }
            traces.push(trace)
        }
        return traces
    }

    _getTrace(s: string) {
        const regex = /at ([\p{Letter}<>\w]*) \(([\p{Letter}<>\w/\\\.]*):(\d+)/u
        const match = s.match(regex);
        if (match && match.length === 4) {
            return {
                at: match[1],
                fileDst: match[2],
                lineDst: parseInt(match[3]),
                col: 0,
            }
        }
        return null
    }
}
