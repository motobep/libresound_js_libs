import { decode } from '@jridgewell/sourcemap-codec';

export function resolveSourceMap(str: string, line: number) {
    try {
        var mapJson = JSON.parse(str)
        const decodedMap = decode(mapJson.mappings);

        var lineObj = getOriginalLineInFile(line, decodedMap)
        if (!lineObj) {
            return null
        }
        var file = mapJson.sources[lineObj.source]
        return {
            source: file,
            line: lineObj.line
        }
    } catch (err) {
        return null
    }
}

function getOriginalLineInFile(line: number, decodedMap: number[][][]) {
    line -= 1
    var segments = decodedMap[line]
    if (segments.length == 0) return null
    var arr = segments[0]
    if (arr.length >= 4) {
        var [genCol, source, origLine, origCol] = arr
        return {
            source,
            line: origLine + 1
        }
    }
    return null
}
