import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('LegalMind Backend is Running. Use /api/files to access data.');
});

// Serve static files from parent directory
const rootDir = path.resolve(__dirname, '..');
app.use('/api/content', express.static(rootDir));

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let relativePath = req.body.path || '';
        // Security check to prevent .. escaping
        if (relativePath.includes('..')) relativePath = '';

        // Upload to root of Foreclosure folder + relative path
        const rootDir = path.resolve(__dirname, '..');
        const targetDir = path.join(rootDir, relativePath);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

// Routes
app.get('/api/files', (req, res) => {
    const rootDir = path.resolve(__dirname, '..');
    let relativePath = req.query.path || '';

    // Security checks
    if (relativePath.includes('..')) {
        return res.status(403).json({ error: "Access denied" });
    }

    const targetPath = path.join(rootDir, relativePath);

    if (!fs.existsSync(targetPath)) {
        return res.json([]);
    }

    try {
        const files = fs.readdirSync(targetPath).map(file => {
            const fullPath = path.join(targetPath, file);
            let stats;
            try {
                stats = fs.statSync(fullPath);
            } catch (e) {
                return null; // Skip invalid/locked files
            }

            return {
                name: file,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                date: stats.mtime
            };
        })
            .filter(Boolean) // Remove nulls
            .filter(f => !['.git', 'node_modules', 'Antigravity'].includes(f.name)); // Hide system folders

        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read directory" });
    }
});

// Search Endpoint
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 3) {
        return res.status(400).json({ error: "Query must be at least 3 characters" });
    }

    const searchFile = path.join(__dirname, 'bulk_extracted_all.txt');

    // Fallback to parts if main file doesn't exist (e.g. absent LFS)
    const filesToSearch = fs.existsSync(searchFile)
        ? [searchFile]
        : ['bulk_extracted_part1.txt', 'bulk_extracted_part2.txt', 'bulk_extracted_part3.txt'].map(f => path.join(__dirname, f)).filter(f => fs.existsSync(f));

    if (filesToSearch.length === 0) {
        return res.status(500).json({ error: "No extracted text files found" });
    }

    const results = [];
    const MAX_RESULTS = 50;
    let matchCount = 0;

    try {
        filesToSearch.forEach(file => {
            if (matchCount >= MAX_RESULTS) return;

            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                if (matchCount >= MAX_RESULTS) return;

                if (line.toLowerCase().includes(query.toLowerCase())) {
                    // Extract snippet (context)
                    const start = Math.max(0, index - 2);
                    const end = Math.min(lines.length, index + 3);
                    const snippet = lines.slice(start, end).join('\n');

                    results.push({
                        file: path.basename(file),
                        line: index + 1,
                        content: line.trim(),
                        context: snippet
                    });
                    matchCount++;
                }
            });
        });

        res.json({ count: results.length, results });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Internal server error during search" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving files from: ${path.resolve(__dirname, '..')}`);
});
