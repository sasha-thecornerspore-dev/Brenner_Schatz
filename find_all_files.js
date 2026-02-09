
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'Antigravity') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

const allFiles = getAllFiles(rootDir, []);
const uniqueFiles = new Map();

allFiles.forEach(file => {
    const stats = fs.statSync(file);
    const key = `${path.basename(file)}_${stats.size}`; // Simple dedup key
    if (!uniqueFiles.has(key)) {
        uniqueFiles.set(key, file);
    }
});

const fileList = Array.from(uniqueFiles.values()).filter(f => f.endsWith('.pdf') || f.endsWith('.docx') || f.endsWith('.txt'));

console.log(JSON.stringify(fileList, null, 2));
