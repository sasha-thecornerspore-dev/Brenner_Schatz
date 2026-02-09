
import fs from 'fs';
import readline from 'readline';

const SEARCH_TERMS = [
    'Report of Sale',
    'Auctioneer',
    'Affidavit',
    'Ratification',
    'Exception',
    'Motion to Stay',
    'Summary Judgment'
];

async function searchFile(filePath) {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineCount = 0;
    let matchCount = 0;

    for await (const line of rl) {
        lineCount++;
        for (const term of SEARCH_TERMS) {
            if (line.includes(term)) {
                console.log(`[Line ${lineCount}] MATCH "${term}": ${line.substring(0, 200)}...`); // Limit output length
                matchCount++;
                if (matchCount > 50) return; // Cap results
            }
        }
    }
}

const filePath = 'bulk_extracted_text.txt';
if (fs.existsSync(filePath)) {
    searchFile(filePath).catch(err => console.error(err));
} else {
    console.log('File not found');
}
