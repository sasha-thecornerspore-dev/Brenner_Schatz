
import fs from 'fs';
import readline from 'readline';

const TARGET_FILES = [
    'Judicial notation and Exception to Report of Sale.pdf',
    'Supporting Exhibit for Opposition to Exceptions to Foreclosure Sale.pdf',
    'Report of Sale'
];

async function findFileStart(filePath) {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineCount = 0;

    for await (const line of rl) {
        lineCount++;
        for (const term of TARGET_FILES) {
            if (line.includes(`=== START OF FILE:`) && line.includes(term)) {
                console.log(`[FOUND] "${term}" starts at line ${lineCount}`);
            }
        }
    }
}

const filePath = 'bulk_extracted_text.txt';
if (fs.existsSync(filePath)) {
    findFileStart(filePath).catch(err => console.error(err));
}
