import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'bulk_extracted_all.txt');
const linkFile = path.join(__dirname, 'bulk_extracted_file_list.md');
const CHUNK_SIZE = 99 * 1024 * 1024; // 99 MB

async function splitFile() {
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        return;
    }

    const stats = fs.statSync(inputFile);
    const totalSize = stats.size;
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

    console.log(`Splitting ${inputFile} (${(totalSize / 1024 / 1024).toFixed(2)} MB) into ${totalChunks} chunks...`);

    const fileStream = fs.createReadStream(inputFile, { highWaterMark: CHUNK_SIZE });
    let chunkIndex = 1;
    let generatedFiles = [];

    for await (const chunk of fileStream) {
        const outputFilename = `bulk_extracted_part${chunkIndex}.txt`;
        const outputPath = path.join(__dirname, outputFilename);

        fs.writeFileSync(outputPath, chunk);
        console.log(`Created ${outputFilename} (${(chunk.length / 1024 / 1024).toFixed(2)} MB)`);

        generatedFiles.push(outputFilename);
        chunkIndex++;
    }

    // Create a markdown index file
    let mdContent = `# Bulk Extracted Text Files\n\nDue to GitHub file size limits, the extracted text has been split into parts:\n\n`;
    generatedFiles.forEach(f => {
        mdContent += `- [${f}](${f})\n`;
    });
    fs.writeFileSync(linkFile, mdContent);

    console.log(`Done. Created ${generatedFiles.length} chunk files.`);
}

splitFile().catch(console.error);
