import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'bulk_extracted_clean.txt');

async function analyzeDocs() {
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        return;
    }

    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const motions = new Set();
    const orders = new Set();

    // Regex to capture titles like "Motion to...", "Order to...", "Order Denying...", etc.
    // We look for lines that START with these terms (ignoring case/whitespace) and capture the full line
    // We limit length to avoid false positives on long sentences
    const motionRegex = /^\s*(?:PLAINTIFF'S|DEFENDANT'S|EMERGENCY)?\s*(MOTION\s+TO\s+|MOTION\s+FOR\s+|OPPOSITION\s+TO\s+)(.{0,100})/i;
    const orderRegex = /^\s*(?:PROPOSED|FINAL)?\s*(ORDER\s+|RULING\s+)(.{0,100})/i;

    console.log(`Analyzing ${inputFile} for motions and orders...`);

    let lineCount = 0;
    for await (const line of rl) {
        lineCount++;

        // Clean line for checking
        const cleanLine = line.trim();
        if (cleanLine.length < 5) continue;

        const motionMatch = cleanLine.match(motionRegex);
        if (motionMatch) {
            // Capitalize first letter of each word for consistency in Set
            const title = cleanLine.toUpperCase().replace(/\s+/g, ' ').trim();
            motions.add(title);
        }

        const orderMatch = cleanLine.match(orderRegex);
        if (orderMatch) {
            const title = cleanLine.toUpperCase().replace(/\s+/g, ' ').trim();
            // Filter out common false positives if necessary
            if (!title.includes("ORDERED THAT")) {
                orders.add(title);
            }
        }
    }

    console.log(`Analysis complete.`);
    console.log(`Unique Motions Found: ${motions.size}`);
    console.log(`Unique Orders Found: ${orders.size}`);

    console.log('\n--- MOTIONS ---');
    [...motions].sort().forEach(m => console.log(m));

    console.log('\n--- ORDERS ---');
    [...orders].sort().forEach(o => console.log(o));
}

analyzeDocs().catch(console.error);
