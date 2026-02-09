
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const fileListPath = path.join(__dirname, 'all_files_list.json');
const rawData = fs.readFileSync(fileListPath);
const files = JSON.parse(rawData);


const outputStream = fs.createWriteStream('bulk_extracted_text_v2.txt', { flags: 'a' });

async function processAllFiles() {
    console.log(`Starting processing of ${files.length} files...`);
    for (const [index, file] of files.entries()) {
        try {
            await processFile(file);
            if (index % 10 === 0) console.log(`Processed ${index + 1}/${files.length}`);
        } catch (err) {
            console.error(`[FATAL ERROR] Failed to process ${file}:`, err);
        }
    }
    console.log('Processing complete.');
    outputStream.end();
}

async function processFile(filename) {
    if (!filename.toLowerCase().endsWith('.pdf')) {
        return;
    }

    const filePath = filename;
    if (!fs.existsSync(filePath)) {
        console.log(`[MISSING] ${filePath}`);
        return;
    }

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);

        const header = `\n\n=== START OF FILE: ${filePath} ===\n\n`;
        const footer = `\n\n=== END OF FILE: ${filePath} ===\n\n`;

        outputStream.write(header + data.text + footer);

    } catch (error) {
        console.log(`[ERROR] Processing ${filename}: ${error.message}`);
        outputStream.write(`\n\n[ERROR PROCESSING FILE: ${filename}]\n\n`);
    }
}

processAllFiles().catch(err => console.error(err));
