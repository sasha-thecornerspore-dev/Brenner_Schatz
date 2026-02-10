import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'bulk_extracted_clean.txt');
const outputFile = path.join(__dirname, 'bulk_extracted_organized.txt');

// Regex patterns
const headerRegex = /^=== \[(.*?)\] (.*?) ===$/;
const dateRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}\b/i;
const shortDateRegex = /\b(1[0-2]|0?[1-9])[\/.-](3[01]|[12][0-9]|0?[1-9])[\/.-](20\d{2}|\d{2})\b/;

const TYPE_MOTION = 'MOTION';
const TYPE_ORDER = 'ORDER';
const TYPE_NOTE = 'NOTE';
const TYPE_CASELAW = 'CASELAW';
const TYPE_OTHER = 'OTHER';

async function organizeText() {
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        return;
    }

    console.log(`Reading ${inputFile}...`);

    // 1. Parse File into Documents
    const documents = [];
    let currentDoc = null;
    let lineBuffer = [];

    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineIdx = 0;
    for await (const line of rl) {
        lineIdx++;
        // Check for header
        if (line.startsWith('=== [') && line.endsWith('===')) {
            // Save previous doc if exists
            if (currentDoc) {
                currentDoc.content = lineBuffer.join('\n');
                analyzeDocument(currentDoc);
                documents.push(currentDoc);
            }

            // Start new doc
            currentDoc = {
                title: line,
                content: '',
                type: TYPE_OTHER,
                date: null,
                dateObj: new Date(0), // Default to epoch for unknown dates
                filename: line // simplistic, clean later if needed
            };
            lineBuffer = [];
        } else {
            lineBuffer.push(line);
        }
    }
    // Save last doc
    if (currentDoc) {
        currentDoc.content = lineBuffer.join('\n');
        analyzeDocument(currentDoc);
        documents.push(currentDoc);
    }

    console.log(`Parsed ${documents.length} documents.`);

    // 2. Sort and Categorize
    const motionsOrders = documents.filter(d => d.type === TYPE_MOTION || d.type === TYPE_ORDER);
    const notes = documents.filter(d => d.type === TYPE_NOTE);
    const caselaw = documents.filter(d => d.type === TYPE_CASELAW);
    const other = documents.filter(d => d.type === TYPE_OTHER);

    // Sort motions/orders chronologically
    motionsOrders.sort((a, b) => a.dateObj - b.dateObj);

    // 3. Write Output
    const outStream = fs.createWriteStream(outputFile);

    outStream.write(`# COMPREHENSIVE CASE FILE: BRENNER V. [REDACTED]\n`);
    outStream.write(`Generated: ${new Date().toISOString()}\n\n`);

    outStream.write(`# TABLE OF CONTENTS\n`);
    outStream.write(`1. PART I: CHRONOLOGICAL CASE HISTORY (Motions & Orders) - ${motionsOrders.length} documents\n`);
    outStream.write(`2. PART II: EVIDENTIARY DOCUMENTS (Notes, Allonges) - ${notes.length} documents\n`);
    outStream.write(`3. PART III: LEGAL AUTHORITIES (Case Law) - ${caselaw.length} documents\n`);
    outStream.write(`4. PART IV: OTHER DOCUMENTS - ${other.length} documents\n\n`);
    outStream.write(`---\n\n`);

    outStream.write(`# PART I: CHRONOLOGICAL CASE HISTORY\n\n`);
    for (const doc of motionsOrders) {
        writeDoc(outStream, doc);
    }

    outStream.write(`\n# PART II: EVIDENTIARY DOCUMENTS\n\n`);
    for (const doc of notes) {
        writeDoc(outStream, doc);
    }

    outStream.write(`\n# PART III: LEGAL AUTHORITIES\n\n`);
    for (const doc of caselaw) {
        writeDoc(outStream, doc);
    }

    outStream.write(`\n# PART IV: OTHER DOCUMENTS\n\n`);
    for (const doc of other) {
        writeDoc(outStream, doc);
    }

    outStream.end();
    console.log(`Organization complete. Saved to ${outputFile}`);
}

function analyzeDocument(doc) {
    const firstChunk = doc.content.substring(0, 3000); // Check first 3000 chars for metadata
    const lowerContent = firstChunk.toLowerCase();
    const titleLower = doc.title.toLowerCase();

    // extract date
    const dateMatch = firstChunk.match(dateRegex);
    if (dateMatch) {
        doc.date = dateMatch[0];
        doc.dateObj = new Date(doc.date);
    } else {
        const shortDateMatch = firstChunk.match(shortDateRegex);
        if (shortDateMatch) {
            doc.date = shortDateMatch[0];
            doc.dateObj = new Date(doc.date);
        }
    }

    // Categorize
    if (titleLower.includes('motion') || lowerContent.includes('motion to') || lowerContent.includes('plaintiff\'s motion') || lowerContent.includes('defendant\'s motion')) {
        doc.type = TYPE_MOTION;
    } else if (titleLower.includes('order') || lowerContent.includes('order') || lowerContent.includes('ruling')) {
        doc.type = TYPE_ORDER;
    } else if (lowerContent.includes('promissory note') || lowerContent.includes('allonge') || lowerContent.includes('indorsement')) {
        doc.type = TYPE_NOTE;
    } else if (lowerContent.includes('v.') && (lowerContent.includes('md.') || lowerContent.includes('u.s.') || lowerContent.includes('f.3d'))) {
        doc.type = TYPE_CASELAW;
    }

    // refinement: if filename has specific keywords, trust that
    if (titleLower.includes('transcript')) doc.type = TYPE_OTHER; // Transcripts are factual record, but maybe keep in "Other" or separate
}

function writeDoc(stream, doc) {
    stream.write(`${doc.title}\n`);
    if (doc.date) stream.write(`[Detected Date: ${doc.date}]\n`);
    stream.write(`[Type: ${doc.type}]\n`);
    stream.write(doc.content);
    stream.write('\n\n================================================================================\n\n');
}

organizeText().catch(console.error);
