import fs from 'fs'

function substitute(filepath, pattern, replacement) {
    let inputFilePath = filepath
    let outputFilePath = filepath
    try {
        const data = fs.readFileSync(inputFilePath, 'utf8');
        const lines = data.split('\n');

        const modifiedLines = lines.map(
            line => line.replace(new RegExp(pattern, 'g'), replacement)
        );

        const result = modifiedLines.join('\n');
        fs.writeFileSync(outputFilePath, result);
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

const a = './dist/MpApi/script.js';
const b = './dist/MpRuntime/script.js';
const pattern = '^export ';

substitute(a, pattern, '');
substitute(b, pattern, '');

