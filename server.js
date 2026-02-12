import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine valid case root
const isDev = process.env.NODE_ENV !== 'production' && !process.resourcesPath;
const CASES_ROOT = isDev
    ? path.join(__dirname, 'cases')
    : path.join(os.homedir(), 'Documents', 'LegalMind', 'cases');

// Ensure cases directory exists
if (!fs.existsSync(CASES_ROOT)) {
    fs.mkdirSync(CASES_ROOT, { recursive: true });
}

const app = express();
app.use(cors());

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('LegalMind Backend Running. Multi-Case Architecture Active.');
});

// list cases
app.get('/api/cases', (req, res) => {
    try {
        const cases = fs.readdirSync(CASES_ROOT).filter(file => {
            const fullPath = path.join(CASES_ROOT, file);
            return fs.statSync(fullPath).isDirectory();
        });
        res.json(cases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to list cases" });
    }
});

// Helper to get case path
const getCasePath = (caseId) => {
    if (!caseId) return null;
    // Security check
    if (caseId.includes('..') || caseId.includes('/') || caseId.includes('\\')) return null;
    return path.join(CASES_ROOT, caseId);
};

// Serve static files for a specific case
app.use('/api/content/:caseId', (req, res, next) => {
    const casePath = getCasePath(req.params.caseId);
    if (!casePath || !fs.existsSync(casePath)) {
        return res.status(404).send('Case not found');
    }
    express.static(casePath)(req, res, next);
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const caseId = req.body.caseId;
        const relativePath = req.body.path || '';

        const casePath = getCasePath(caseId);
        if (!casePath) return cb(new Error("Invalid case ID"));

        // Security check
        if (relativePath.includes('..')) return cb(new Error("Invalid path"));

        const targetDir = path.join(casePath, relativePath);

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

app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully', file: req.file });
});

// List files in a case
app.get('/api/files', (req, res) => {
    const caseId = req.query.caseId;
    const relativePath = req.query.path || '';

    const casePath = getCasePath(caseId);
    if (!casePath || !fs.existsSync(casePath)) {
        return res.status(404).json({ error: "Case not found" });
    }

    // Security checks
    if (relativePath.includes('..')) {
        return res.status(403).json({ error: "Access denied" });
    }

    const targetPath = path.join(casePath, relativePath);

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
                return null;
            }

            return {
                name: file,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                date: stats.mtime
            };
        })
            .filter(Boolean)
            .filter(f => !['.git', 'node_modules'].includes(f.name));

        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read directory" });
    }
});

// Search Endpoint
app.get('/api/search', (req, res) => {
    const caseId = req.query.caseId;
    const query = req.query.q;

    const casePath = getCasePath(caseId);
    if (!casePath || !fs.existsSync(casePath)) {
        return res.status(404).json({ error: "Case not found" });
    }

    if (!query || query.length < 3) {
        return res.status(400).json({ error: "Query must be at least 3 characters" });
    }

    const searchFile = path.join(casePath, 'bulk_extracted_all.txt');

    // Fallback to parts
    const filesToSearch = fs.existsSync(searchFile)
        ? [searchFile]
        : ['bulk_extracted_part1.txt', 'bulk_extracted_part2.txt', 'bulk_extracted_part3.txt']
            .map(f => path.join(casePath, f))
            .filter(f => fs.existsSync(f));

    if (filesToSearch.length === 0) {
        return res.status(500).json({ error: "No extracted text files found for this case" });
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

// Timeline Endpoint
app.get('/api/timeline', (req, res) => {
    const caseId = req.query.caseId;
    const casePath = getCasePath(caseId);
    if (!casePath || !fs.existsSync(casePath)) {
        return res.status(404).json({ error: "Case not found" });
    }

    const searchFile = path.join(casePath, 'bulk_extracted_all.txt');
    const filesToSearch = fs.existsSync(searchFile)
        ? [searchFile]
        : ['bulk_extracted_part1.txt', 'bulk_extracted_part2.txt', 'bulk_extracted_part3.txt']
            .map(f => path.join(casePath, f))
            .filter(f => fs.existsSync(f));

    if (filesToSearch.length === 0) {
        return res.json([]);
    }

    const events = [];

    try {
        filesToSearch.forEach(file => {
            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n');
            const dateRegex = /\[Detected Date: (.*?)\]/;

            let currentDoc = "Unknown Document";
            let currentType = "UNKNOWN";

            lines.forEach(line => {
                const headerMatch = line.match(/^=== \[(.*?)\] (.*?) ===$/);
                if (headerMatch) {
                    currentType = headerMatch[1];
                    currentDoc = headerMatch[2];
                    return;
                }

                const dateMatch = line.match(dateRegex);
                if (dateMatch) {
                    const dateStr = dateMatch[1];
                    const dateObj = new Date(dateStr);
                    if (!isNaN(dateObj.getTime())) {
                        events.push({
                            date: dateObj.toISOString().split('T')[0],
                            title: path.basename(currentDoc),
                            type: currentType,
                            docPath: currentDoc
                        });
                    }
                }
            });
        });

        const uniqueEvents = Array.from(new Set(events.map(e => JSON.stringify(e)))).map(e => JSON.parse(e));
        uniqueEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(uniqueEvents);

    } catch (err) {
        console.error("Timeline error:", err);
        res.status(500).json({ error: "Failed to generate timeline" });
    }
});

// Research Endpoint
app.get('/api/research', (req, res) => {
    const caseId = req.query.caseId;
    const type = req.query.type || 'general';

    const casePath = getCasePath(caseId);
    if (!casePath || !fs.existsSync(casePath)) {
        return res.status(404).json({ error: "Case not found" });
    }

    const searchFile = path.join(casePath, 'bulk_extracted_all.txt');
    const filesToSearch = fs.existsSync(searchFile)
        ? [searchFile]
        : ['bulk_extracted_part1.txt', 'bulk_extracted_part2.txt', 'bulk_extracted_part3.txt']
            .map(f => path.join(casePath, f))
            .filter(f => fs.existsSync(f));

    if (filesToSearch.length === 0) return res.status(500).json({ error: "No data found" });

    let report = `# Deep Research Report: ${type.toUpperCase()}\n\n`;
    let findings = [];

    try {
        filesToSearch.forEach(file => {
            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n');
            let currentDoc = "Unknown";

            lines.forEach((line, i) => {
                const headerMatch = line.match(/^=== \[(.*?)\] (.*?) ===$/);
                if (headerMatch) currentDoc = headerMatch[2];

                if (type === 'standing') {
                    if (line.match(/(assignment|allonge|indorse|holder|possession)/i)) {
                        findings.push(`- **${currentDoc}**: "${line.trim()}"`);
                    }
                } else if (type === 'limitations') {
                    if (line.match(/(default|breach|accelerat|due date)/i)) {
                        findings.push(`- **${currentDoc}**: "${line.trim()}"`);
                    }
                } else {
                    if (line.match(/(foreclos|judgment|order)/i)) {
                        findings.push(`- **${currentDoc}**: "${line.trim()}"`);
                    }
                }
            });
        });

        if (findings.length === 0) {
            report += "No specific evidence found matching this criteria.";
        } else {
            report += `Found ${findings.length} relevant citations.\n\n` + findings.slice(0, 50).join('\n');
        }

        res.json({ report });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Research failed" });
    }
});

const PORT = 3001;

// Serve React App
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve React's index.html
app.get('*', (req, res) => {
    // Check if request is for API, if so, 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API Endpoint not found" });
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving cases from: ${CASES_ROOT}`);
    console.log(`Running in ${isDev ? 'Development' : 'Production'} mode`);
});
