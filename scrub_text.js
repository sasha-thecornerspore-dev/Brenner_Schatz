import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'bulk_extracted_all.txt');
const outputFile = path.join(__dirname, 'bulk_extracted_clean.txt');

// Sort by length specific to general to ensure specific matches first
const sensitiveTerms = [
    'sarah robles',
    'marshall',
    'schatz',
    'robles',
    'sarah'
];

// Compile regex for faster matching, case insensitive
const sensitiveRegex = new RegExp(sensitiveTerms.join('|'), 'gi');

async function scrubFile() {
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        return;
    }

    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const outputStream = fs.createWriteStream(outputFile);

    let lineCount = 0;
    let redactedCount = 0;
    let garbledCount = 0;

    console.log(`Starting scrub of ${inputFile}...`);

    for await (const line of rl) {
        lineCount++;

        // 1. Check for Garbled Text
        if (isGarbled(line)) {
            garbledCount++;
            continue; // Skip this line entirely
        }

        // 2. Check for Sensitive Terms
        let processedLine = line;
        if (sensitiveRegex.test(line)) {
            processedLine = line.replace(sensitiveRegex, '[REDACTED]');
            redactedCount++;
        }

        outputStream.write(processedLine + '\n');
    }

    outputStream.end();
    console.log(`Scrubbing complete.`);
    console.log(`Lines processed: ${lineCount}`);
    console.log(`Lines removed (garbled): ${garbledCount}`);
    console.log(`Lines redacted (sensitive): ${redactedCount}`);
    console.log(`Output saved to: ${outputFile}`);
}

function isGarbled(line) {
    if (!line || line.trim().length === 0) return false;

    // A. Check length - extremely long lines are often minified code or binary spills
    if (line.length > 2000) return true;

    // B. Check for high density of non-ASCII characters or control characters
    // Matches characters that are NOT: alphanumeric, punctuation, common symbols, whitespace, or common smart quotes/dashes
    const nonStandardChars = line.match(/[^\x20-\x7E\t\r\n\u2018-\u201D\u2013-\u2014\u2022]/g);

    if (nonStandardChars) {
        // If more than 30% of the line is non-standard, likely garbled
        const ratio = nonStandardChars.length / line.length;
        if (ratio > 0.3) return true;
    }

    // C. Check for replacement characters often seen in bad decoding
    if (line.includes('\uFFFD')) return true;

    return false;
}

scrubFile().catch(console.error);
