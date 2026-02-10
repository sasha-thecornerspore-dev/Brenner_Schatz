import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'bulk_extracted_all.txt');

// Sort by length specific to general to ensure specific matches first
const sensitiveTerms = [
    'sarah robles',
    'marshall',
    'schatz',
    'robles',
    'sarah'
];

const sensitiveRegex = new RegExp(sensitiveTerms.join('|'), 'gi');

async function debugFile() {
    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineCount = 0;
    console.log(`Debugging first 100 lines of ${inputFile}...`);

    for await (const line of rl) {
        lineCount++;
        if (lineCount > 100) break;

        const garbled = isGarbled(line);
        const sensitive = sensitiveRegex.test(line);

        console.log(`[Line ${lineCount}] Length: ${line.length}`);
        console.log(`Content: ${line.substring(0, 100)}...`);
        console.log(`Garbled: ${garbled}`);
        if (garbled) {
            const nonStandardChars = line.match(/[^\x20-\x7E\t\r\n]/g);
            const ratio = nonStandardChars ? nonStandardChars.length / line.length : 0;
            console.log(`  Reason: Ratio=${ratio.toFixed(2)}, Replacement=${line.includes('')}`);
        }
        console.log(`Sensitive Match: ${sensitive}`);
        console.log('---');
    }
}

function isGarbled(line) {
    if (!line || line.trim().length === 0) return false;

    if (line.length > 2000) return true;

    const nonStandardChars = line.match(/[^\x20-\x7E\t\r\n]/g);

    if (nonStandardChars) {
        const ratio = nonStandardChars.length / line.length;
        if (ratio > 0.2) return true;
    }

    if (line.includes('')) return true;

    return false;
}

debugFile().catch(console.error);
