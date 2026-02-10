import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scan the entire Foreclosure directory
const rootDir = path.resolve(__dirname, '..');

const outputPath = path.join(__dirname, 'bulk_extracted_all.txt');
const outputStream = fs.createWriteStream(outputPath, { flags: 'w' });

// Text file extensions
const textExtensions = ['.txt', '.md', '.json', '.csv', '.xml', '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.css', '.log'];

// Files to skip
const skipPatterns = ['node_modules', '.git', 'bulk_extracted', 'package-lock.json'];

function shouldSkip(filePath) {
    return skipPatterns.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            if (shouldSkip(fullPath)) return;

            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    getAllFiles(fullPath, arrayOfFiles);
                } else {
                    arrayOfFiles.push(fullPath);
                }
            } catch (err) {
                console.log(`[SKIP] Cannot access: ${fullPath}`);
            }
        });
    } catch (err) {
        console.log(`[SKIP] Cannot read directory: ${dirPath}`);
    }

    return arrayOfFiles;
}

async function extractFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

async function extractFromDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

function extractFromText(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

async function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let text = null;
    let fileType = 'unknown';

    try {
        if (ext === '.pdf') {
            text = await extractFromPDF(filePath);
            fileType = 'PDF';
        } else if (ext === '.docx') {
            text = await extractFromDOCX(filePath);
            fileType = 'DOCX';
        } else if (ext === '.doc') {
            // .doc files need different handling, skip for now
            console.log(`[SKIP] Old .doc format: ${filePath}`);
            return null;
        } else if (textExtensions.includes(ext)) {
            text = extractFromText(filePath);
            fileType = 'TEXT';
        } else {
            // Skip binary files like images, zip, etc.
            return null;
        }

        if (text && text.trim().length > 0) {
            const header = `\n\n${'='.repeat(80)}\n=== [${fileType}] ${filePath} ===\n${'='.repeat(80)}\n\n`;
            const footer = `\n\n=== END OF FILE ===\n\n`;
            return header + text + footer;
        }
    } catch (error) {
        console.log(`[ERROR] ${filePath}: ${error.message}`);
        return `\n\n[ERROR PROCESSING: ${filePath}]\nError: ${error.message}\n\n`;
    }

    return null;
}

async function main() {
    console.log(`Scanning directory: ${rootDir}`);
    const allFiles = getAllFiles(rootDir);
    console.log(`Found ${allFiles.length} files to process`);

    let processed = 0;
    let extracted = 0;

    for (const filePath of allFiles) {
        const result = await processFile(filePath);
        if (result) {
            outputStream.write(result);
            extracted++;
        }
        processed++;

        if (processed % 50 === 0) {
            console.log(`Progress: ${processed}/${allFiles.length} (${extracted} extracted)`);
        }
    }

    outputStream.end();
    console.log(`\nComplete! Processed ${processed} files, extracted text from ${extracted} files.`);
    console.log(`Output saved to: ${outputPath}`);
}

main().catch(err => console.error('Fatal error:', err));
