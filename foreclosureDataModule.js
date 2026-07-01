import fs from 'fs';
import readline from 'readline';
import path from 'path';

/**
 * Perform a stream-based search on the given files to prevent memory issues.
 * @param {string[]} filesToSearch - Array of file paths to search
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} Array of result objects
 */
export async function searchCaseData(filesToSearch, query, maxResults = 50) {
    const results = [];
    let matchCount = 0;
    const lowerQuery = query.toLowerCase();

    for (const file of filesToSearch) {
        if (matchCount >= maxResults) break;
        if (!fs.existsSync(file)) continue;

        const fileStream = fs.createReadStream(file);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const window = []; // Keep a sliding window of lines
        let lineIndex = 0;

        for await (const line of rl) {
            lineIndex++;
            window.push(line);
            if (window.length > 5) {
                window.shift();
            }

            if (line.toLowerCase().includes(lowerQuery)) {
                if (matchCount >= maxResults) break;

                // We have a match. In a true streaming way, getting the NEXT 2 lines is tricky without pausing, 
                // but we have the PREVIOUS 2 lines in the window. We'll just use the current window as context 
                // for simplicity and performance, which provides up to 4 lines before and the current line.
                // It's a trade-off for stream efficiency vs exact context mirroring.
                
                results.push({
                    file: path.basename(file),
                    line: lineIndex,
                    content: line.trim(),
                    context: window.join('\n')
                });
                matchCount++;
            }
        }
    }

    return results;
}

/**
 * Stream-based timeline extraction
 * @param {string[]} filesToSearch - Array of file paths to search
 * @returns {Promise<Array>} Timeline events
 */
export async function getTimelineEvents(filesToSearch) {
    const events = [];
    const dateRegex = /\[Detected Date: (.*?)\]/;

    for (const file of filesToSearch) {
        if (!fs.existsSync(file)) continue;

        const fileStream = fs.createReadStream(file);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let currentDoc = "Unknown Document";
        let currentType = "UNKNOWN";

        for await (const line of rl) {
            const headerMatch = line.match(/^=== \[(.*?)\] (.*?) ===$/);
            if (headerMatch) {
                currentType = headerMatch[1];
                currentDoc = headerMatch[2];
                continue;
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
        }
    }

    const uniqueEvents = Array.from(new Set(events.map(e => JSON.stringify(e)))).map(e => JSON.parse(e));
    uniqueEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    return uniqueEvents;
}

/**
 * Stream-based research extraction
 * @param {string[]} filesToSearch - Array of file paths to search
 * @param {string} type - Research type
 * @returns {Promise<string>} Research report markdown
 */
export async function generateResearchReport(filesToSearch, type = 'general') {
    let findings = [];
    
    let regex;
    if (type === 'standing') {
        regex = /(assignment|allonge|indorse|holder|possession)/i;
    } else if (type === 'limitations') {
        regex = /(default|breach|accelerat|due date)/i;
    } else {
        regex = /(foreclos|judgment|order)/i;
    }

    for (const file of filesToSearch) {
        if (!fs.existsSync(file)) continue;

        const fileStream = fs.createReadStream(file);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let currentDoc = "Unknown";

        for await (const line of rl) {
            const headerMatch = line.match(/^=== \[(.*?)\] (.*?) ===$/);
            if (headerMatch) {
                currentDoc = headerMatch[2];
                continue;
            }

            if (regex.test(line)) {
                findings.push(`- **${currentDoc}**: "${line.trim()}"`);
                if (findings.length >= 200) break; // hard limit to prevent giant reports
            }
        }
    }

    let report = `# Deep Research Report: ${type.toUpperCase()}\n\n`;
    
    if (findings.length === 0) {
        report += "No specific evidence found matching this criteria.";
    } else {
        report += `Found ${findings.length} relevant citations.\n\n` + findings.slice(0, 50).join('\n');
    }

    return report;
}
