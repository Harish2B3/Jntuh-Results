
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { JSDOM } = require('jsdom');

// Dynamic import for node-fetch (ESM)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const crypto = require('crypto');

// --- ENCRYPTION CONFIGURATION ---
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY || 'default_secret_key_1234567890')).digest();
const ALGORITHM = 'aes-256-cbc';

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('[Crypto] Decryption failed:', e.message);
        return text; // Fallback to raw if not encrypted (migration support)
    }
};


const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'results.json');

// --- CRASH HANDLERS ---
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    // Keep running if possible, or exit gracefully
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- FILE SYSTEM RESULTS CONFIGURATION ---
const RESULTS_DIR = path.join(__dirname, 'Results');
if (!fs.existsSync(RESULTS_DIR)) {
    try {
        fs.mkdirSync(RESULTS_DIR, { recursive: true });
        console.log(`[Server] Created directory: ${RESULTS_DIR}`);
    } catch (e) {
        console.error(`[Server] Failed to create Results directory: ${e}`);
    }
}

// Unified results file for all student results
const UNIFIED_RESULTS_FILE = path.join(RESULTS_DIR, 'jntuh_results.json');

/**
 * Reads the unified results JSON file.
 * Returns an object where each key is a hallTicket and the value is an array of result entries.
 */
const readUnifiedResults = () => {
    if (!fs.existsSync(UNIFIED_RESULTS_FILE)) return {};
    try {
        let data = fs.readFileSync(UNIFIED_RESULTS_FILE, 'utf8').trim();
        if (!data) return {};

        // Check if data is encrypted (contains ':') or plain JSON
        if (data.includes(':') && !data.startsWith('{')) {
            data = decrypt(data);
        }

        return JSON.parse(data);
    } catch (e) {
        console.error('Error reading unified results file:', e);
        return {};
    }
};

/**
 * Saves a result for a student. Organized by student ID and then by result type.
 * @param {string} hallTicket - Student identifier.
 * @param {string} resultType - Type of result (e.g., 'OVERALL_RESULTS' or Exam Title).
 * @param {object} data - Result data to store.
 */
const saveUnifiedResult = (hallTicket, resultType, data) => {
    const studentKey = hallTicket.toUpperCase();
    const typeKey = resultType || 'GENERAL';
    const allResults = readUnifiedResults();

    // Ensure student entry exists as an object
    if (!allResults[studentKey] || Array.isArray(allResults[studentKey])) {
        allResults[studentKey] = {};
    }

    // Store/Update the specific result type (reduces redundancy for same exam)
    allResults[studentKey][typeKey] = {
        data,
        savedAt: new Date().toISOString()
    };

    // --- AUTOMATICALLY UPDATE OVERALL_RESULTS ---
    // If we are saving a specific exam result, we should also update the student's overall record.
    if (typeKey !== 'OVERALL_RESULTS' && data && data.subjects) {
        try {
            // Helper to extract a sortable/comparable semester string (e.g., "1-1")
            const getRawSem = (sem) => {
                if (!sem) return 'Unknown';
                const match = sem.match(/(\d-\d)/);
                return match ? match[1] : sem;
            };

            const targetSemRaw = getRawSem(data.semester);

            // Initialize OVERALL_RESULTS if it doesn't exist
            if (!allResults[studentKey]['OVERALL_RESULTS']) {
                allResults[studentKey]['OVERALL_RESULTS'] = {
                    data: {
                        hallTicket: studentKey,
                        name: data.name || "Student",
                        course: data.course || "B.TECH",
                        cgpa: 0,
                        totalCredits: 0,
                        semesters: []
                    },
                    savedAt: new Date().toISOString()
                };
            }

            const overall = allResults[studentKey]['OVERALL_RESULTS'].data;

            // Find existing semester entry or create new one
            let semEntry = overall.semesters.find(s => getRawSem(s.semester) === targetSemRaw);

            if (!semEntry) {
                semEntry = {
                    semester: targetSemRaw, // Use raw for consistency
                    sgpa: 0,
                    totalCredits: 0,
                    results: []
                };
                overall.semesters.push(semEntry);
            }

            // Sync student name (in case it was missing)
            if (data.name && data.name !== "Student") overall.name = data.name;

            // Merge subjects: Latest result for a subject code wins
            data.subjects.forEach(newSub => {
                const existingIdx = semEntry.results.findIndex(s => s.code === newSub.code);
                if (existingIdx > -1) {
                    semEntry.results[existingIdx] = { ...newSub };
                } else {
                    semEntry.results.push({ ...newSub });
                }
            });

            // Recalculate SGPA for the modified semester
            const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0, 'Ab': 0 };
            let sPoints = 0;
            let sCredits = 0;
            semEntry.results.forEach(s => {
                const pts = gradePoints[s.grade] || 0;
                sPoints += pts * (s.credits || 0);
                sCredits += (s.credits || 0);
            });
            semEntry.sgpa = sCredits > 0 ? parseFloat((sPoints / sCredits).toFixed(2)) : 0;
            semEntry.totalCredits = sCredits;

            // Recalculate CGPA across all semesters
            let totalPoints = 0;
            let totalCredits = 0;
            overall.semesters.forEach(sem => {
                let semSubPoints = 0;
                sem.results.forEach(s => {
                    const pts = gradePoints[s.grade] || 0;
                    semSubPoints += pts * (s.credits || 0);
                });
                totalPoints += semSubPoints;
                totalCredits += sem.totalCredits;
            });
            overall.cgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
            overall.totalCredits = totalCredits;

            // Re-sort semesters for a clean display (1-1, 1-2, 2-1...)
            overall.semesters.sort((a, b) => a.semester.localeCompare(b.semester));

            // Update the overall saved timestamp
            allResults[studentKey]['OVERALL_RESULTS'].savedAt = new Date().toISOString();

        } catch (updateErr) {
            console.error('[Sync] Error updating OVERALL_RESULTS:', updateErr);
        }
    }

    try {
        const jsonData = JSON.stringify(allResults);
        const encryptedData = encrypt(jsonData);
        fs.writeFileSync(UNIFIED_RESULTS_FILE, encryptedData);
        console.log(`[File System] Saved unified result [${typeKey}] for ${studentKey} (Encrypted)`);
        return true;
    } catch (e) {
        console.error('Error writing unified results file:', e);
        return false;
    }
};


// --- EMAIL CONFIGURATION REMOVED ---

// --- PERSISTENT RESULTS DATABASE LOGIC ---

let studentRecords = {};
let saveTimeout = null;

// 1. Load Data from JSON file on startup
const loadData = () => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            studentRecords = JSON.parse(rawData);
            console.log(`[Server] Loaded ${Object.keys(studentRecords).length} records from results.json`);
        } catch (err) {
            console.error("[Server] Error reading results.json:", err);
            studentRecords = {};
        }
    }
};

// 2. Save Data to JSON file (Debounced)
// --- JNTUH EXAM CACHE ---
let examCache = {
    data: null,
    lastFetched: 0
};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const fetchAndCacheExams = async () => {
    const now = Date.now();
    // Return cached data if valid
    if (examCache.data && (now - examCache.lastFetched < CACHE_DURATION)) {
        return examCache.data;
    }

    console.log('[Server] Refreshing Exam Cache from JNTUH...');
    try {
        const homeUrl = process.env.JNTUH_HOME_URL || 'http://results.jntuh.ac.in/jsp/home.jsp';
        const response = await fetch(homeUrl);
        if (!response.ok) throw new Error('Failed to reach JNTUH home page');

        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const table = doc.getElementsByTagName("tbody")[0];
        const rows = table ? table.getElementsByTagName("tr") : [];
        const exams = [];

        for (const row of rows) {
            const cols = row.getElementsByTagName("td");
            if (cols.length > 0) {
                const link = row.getElementsByTagName("a")[0];
                if (link) {
                    const href = link.getAttribute("href");
                    const title = link.textContent.trim();
                    if (href && href.includes('?')) {
                        const query = href.split('?')[1];
                        exams.push({
                            title,
                            code: query,
                            url: href,
                            date: cols[0]?.textContent.trim()
                        });
                    }
                }
            }
        }

        // Remove duplicates and ensure data is clean
        const uniqueExams = Array.from(new Map(exams.map(item => [item.code, item])).values());

        examCache = {
            data: uniqueExams,
            lastFetched: now
        };
        console.log(`[Server] Exam Cache Updated: ${uniqueExams.length} exams found.`);
        return uniqueExams;
    } catch (err) {
        console.error('[Server] Cache Scraper Error:', err);
        return examCache.data || []; // Fallback to stale data if any
    }
};

// Initial Fetch and Setup Auto-Refresh
fetchAndCacheExams();
setInterval(fetchAndCacheExams, CACHE_DURATION);

// --- KPI CARDS & KPI DATA ---
const saveData = () => {
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(studentRecords, null, 2));
            console.log("[Server] Batch saved data to results.json");
        } catch (err) {
            console.error("[Server] Error writing to results.json:", err);
        }
    }, 2000); // 2 seconds debounce
};

// --- DYNAMIC RANGE LOGIC ---
const generateSuffixes = () => {
    const list = [];
    for (let i = 1; i <= 99; i++) list.push(i.toString().padStart(2, '0'));
    const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    for (let i = 0; i < alpha.length; i++) {
        for (let j = 0; j <= 9; j++) list.push(`${alpha[i]}${j}`);
    }
    return list;
};

const SUFFIX_LIST = generateSuffixes();

const shouldSkipExpansion = (prefix, targetIndex) => {
    const THRESHOLD = 5;
    let failedBack = 0;
    for (let k = 1; k <= THRESHOLD; k++) {
        const idx = targetIndex - k;
        if (idx < 0) break;
        const id = `${prefix}${SUFFIX_LIST[idx]}`;
        if (studentRecords[id] && studentRecords[id].status === 'FAILED') failedBack++;
        else break;
    }
    if (failedBack >= THRESHOLD) return true;

    let failedForward = 0;
    for (let k = 1; k <= THRESHOLD; k++) {
        const idx = targetIndex + k;
        if (idx >= SUFFIX_LIST.length) break;
        const id = `${prefix}${SUFFIX_LIST[idx]}`;
        if (studentRecords[id] && studentRecords[id].status === 'FAILED') failedForward++;
        else break;
    }
    if (failedForward >= THRESHOLD) return true;
    return false;
};

const expandCluster = (htNo) => {
    if (!htNo || htNo.length !== 10) return;
    const prefix = htNo.substring(0, 8);
    const suffix = htNo.substring(8, 10);
    const centerIndex = SUFFIX_LIST.indexOf(suffix);
    if (centerIndex === -1) return;

    const start = Math.max(0, centerIndex - 5);
    const end = Math.min(SUFFIX_LIST.length - 1, centerIndex + 5);
    let updates = false;

    for (let i = start; i <= end; i++) {
        if (i === centerIndex) continue;
        const neighborId = `${prefix}${SUFFIX_LIST[i]}`;
        if (studentRecords[neighborId]) continue;
        if (shouldSkipExpansion(prefix, i)) continue;
        studentRecords[neighborId] = { status: 'PENDING', data: null, lastUpdated: null };
        updates = true;
    }
    if (updates) saveData();
};

const ensureRecord = (htNo) => {
    if (!studentRecords[htNo]) {
        studentRecords[htNo] = { status: 'PENDING', data: null, lastUpdated: null };
        expandCluster(htNo);
        saveData();
    } else {
        expandCluster(htNo);
    }
};

loadData();



// --- FETCH OFFICIAL RESULT HANDLER ---
// This endpoint is used by the scraper to fetch results from JNTUH and cache them locally.

// --- SAVE RESULT ENDPOINT (FILE SYSTEM) ---
app.post('/api/save-result', async (req, res) => {
    try {
        const { data, type, identifier } = req.body;
        if (!data || !identifier) return res.status(400).json({ error: 'Data and Identifier required' });

        const success = saveUnifiedResult(identifier, type || 'OVERALL_RESULTS', data);
        if (success) {
            res.json({ success: true, id: identifier });
        } else {
            res.status(500).json({ error: 'Failed to write result to file' });
        }
    } catch (e) {
        console.error('Save Result Error:', e);
        res.status(500).json({ error: 'Failed to save result' });
    }
});

// --- PROXY ROUTE FOR DHETHI API ---
app.get('/api/proxy/dhethi', async (req, res) => {
    const { rollNumber } = req.query;
    if (!rollNumber) {
        return res.status(400).json({ success: false, error: 'Roll number is required' });
    }

    try {
        const dhethiBaseUrl = process.env.DHETHI_API_URL || 'https://jntuhresults.dhethi.com/api/getAllResult';
        const targetUrl = `${dhethiBaseUrl}?rollNumber=${rollNumber}`;
        const response = await fetch(targetUrl);

        if (!response.ok) {
            return res.status(response.status).json({ success: false, error: 'External API Error' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Proxy Fetch Error:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error while fetching results' });
    }
});

// --- OFFICIAL JNTUH SCRAPERS ---

// 1. Fetch Exam Codes (Robust)
app.get('/api/exam-urls', async (req, res) => {
    const exams = await fetchAndCacheExams();
    res.json({ success: true, data: exams });
});

// 2. Fetch Exam Codes (Robust - API)
app.get('/api/exam-codes', async (req, res) => {
    const exams = await fetchAndCacheExams();
    res.json({ success: true, exams: exams });
});

// --- GET SAVED RESULT ENDPOINT ---
// --- GET SAVED RESULT ENDPOINT (FILE SYSTEM) ---
app.get('/api/saved-result', (req, res) => {
    const { id, type } = req.query;
    if (!id) return res.status(400).json({ error: 'Identifier required' });

    try {
        const allResults = readUnifiedResults();
        const studentData = allResults[id.toUpperCase()];
        const resultType = type || 'OVERALL_RESULTS';

        if (studentData && studentData[resultType]) {
            console.log(`[File System Cache] Hit: ${id} [${resultType}]`);
            return res.json({ success: true, data: studentData[resultType].data });
        } else {
            return res.status(404).json({ success: false, error: 'Not found' });
        }
    } catch (e) {
        console.error('File Read Error:', e);
        return res.status(500).json({ error: 'File system error' });
    }
});

// 2. Fetch Official Result (Robust HTML Parsing)
app.post('/api/fetch-official', async (req, res) => {
    const { htno, code, title } = req.body;
    if (!htno || !code) return res.status(400).json({ error: 'HTNo and Exam Code required' });

    // --- CHECK FILE CACHE FIRST ---
    const dbType = title || "OFFICIAL";

    // Helper to extract semester from title
    const extractSemester = (rawTitle) => {
        if (!rawTitle || rawTitle === "OFFICIAL") return "OFFICIAL RESULT";
        const yearMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4' };
        // Support Roman numerals or Digits, and Semester or Sem
        const yearMatch = rawTitle.match(/([0-9IV]+)(?:st|nd|rd|th)?\s*Year/i);
        const semMatch = rawTitle.match(/([0-9IV]+)(?:st|nd|rd|th)?\s*(?:Semester|Sem)/i);

        if (yearMatch && semMatch) {
            const year = yearMap[yearMatch[1].toUpperCase()] || yearMatch[1];
            const sem = yearMap[semMatch[1].toUpperCase()] || semMatch[1];
            return `${year}-${sem} Semester`;
        }
        return rawTitle; // Fallback to full title
    };

    try {
        const allResults = readUnifiedResults();
        const studentKey = htno.toUpperCase();
        if (allResults[studentKey] && allResults[studentKey][dbType]) {
            console.log(`[Official Fetch] Serving from File System: ${dbType} - ${htno}`);
            let cachedResult = allResults[studentKey][dbType].data;

            // Fix legacy generic semester labels on the fly
            if (cachedResult.semester === "OFFICIAL RESULT" && title && title !== "OFFICIAL") {
                cachedResult.semester = extractSemester(title);
            }

            return res.json({ success: true, data: cachedResult, source: 'CACHE' });
        }
    } catch (e) { console.error("Cache Check Error:", e); }

    try {
        // Construct URL
        const baseActionUrl = process.env.JNTUH_RESULT_ACTION_URL || 'http://results.jntuh.ac.in/resultAction';
        let targetUrl = `${baseActionUrl}?${code}&htno=${htno}`;
        console.log(`[Official Fetch] ${targetUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        let response;
        try {
            response = await fetch(targetUrl, { signal: controller.signal });
        } catch (fetchErr) {
            if (fetchErr.name === 'AbortError') {
                throw new Error('JNTUH Server Timeout (15s). Please try again later.');
            }
            throw fetchErr;
        } finally {
            clearTimeout(timeoutId);
        }

        // FAILOVER LOGIC: If 500 or error, try fallback parameters
        if (response.status === 500) {
            console.log("Received 500 from JNTUH. Retrying with fallback parameters...");
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 15000);

            try {
                const baseActionUrl = process.env.JNTUH_RESULT_ACTION_URL || 'http://results.jntuh.ac.in/resultAction';
                targetUrl = `${baseActionUrl}?${code}&result=null&grad=null&htno=${htno}`;
                console.log(`[Official Fetch Retry] ${targetUrl}`);
                response = await fetch(targetUrl, { signal: retryController.signal });
            } catch (retryErr) {
                if (retryErr.name === 'AbortError') throw new Error('JNTUH Server Timeout on retry.');
                throw retryErr;
            } finally {
                clearTimeout(retryTimeoutId);
            }
        }

        if (!response.ok) {
            throw new Error(`JNTUH Server Error: ${response.status}`);
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Smart Table Detection
        const tables = doc.querySelectorAll('table');
        let infoTable = null;
        let resultTable = null;

        tables.forEach(table => {
            const text = table.textContent.toLowerCase();
            // Info table usually has 'Hall Ticket No' and 'Name'
            if (text.includes('hall ticket no') && text.includes('name') && text.includes('father')) {
                infoTable = table;
            }
            // Result table usually has 'Subject Code' and 'Subject Name' and 'Grade'
            if (text.includes('subject code') && text.includes('subject name') && text.includes('grade')) {
                resultTable = table;
            }
        });

        if (!infoTable || !resultTable) {
            // Fallback for some result formats
            if (tables.length >= 2) {
                infoTable = tables[0];
                resultTable = tables[1];
            } else {
                // Check if it's an "Invalid HallTicket" page
                if (doc.body.textContent.includes('Invalid Hall')) {
                    return res.status(404).json({ success: false, error: 'Invalid Hall Ticket Number' });
                }
                return res.status(502).json({
                    success: false,
                    error: 'Result structure mismatch. Please visit the official JNTUH Results Website.'
                });
            }
        }

        // Extract Personal Info
        let name = "Student";
        let course = "B.TECH";

        const infoRows = infoTable.querySelectorAll('tr');
        infoRows.forEach(tr => {
            const cells = tr.querySelectorAll('td');
            // Iterate through cells looking for labels
            for (let i = 0; i < cells.length; i++) {
                const cellText = cells[i].textContent.trim().toLowerCase();

                // Match "Name" or "Student Name" or "Name of the Student"
                if (cellText.includes('name') && !cellText.includes('father') && !cellText.includes('mother')) {
                    // Usually the value is in the next cell
                    if (i + 1 < cells.length) {
                        const val = cells[i + 1].textContent.trim();
                        // Sometimes the cell contains " :" or ":" at the start
                        name = val.replace(/^[:\s-]+/, '').trim();
                        break; // Move to next row or finish
                    }
                }

                if (cellText.includes('course') || cellText.includes('programme')) {
                    if (i + 1 < cells.length) {
                        course = cells[i + 1].textContent.trim().replace(/^[:\s-]+/, '').trim();
                        break;
                    }
                }
            }
        });

        // Fail-safe: If name is still "Student", check if any cell contains "Name :" followed by text
        if (name === "Student") {
            infoRows.forEach(tr => {
                const text = tr.textContent.trim();
                const match = text.match(/Name\s*:\s*([^;,\n]+)/i);
                if (match && match[1]) {
                    name = match[1].trim();
                }
            });
        }

        console.log(`[Scraper] Info Extracted -> Name: ${name}, Course: ${course}`);

        // Extract Subjects
        const subjects = [];
        const resultRows = resultTable.querySelectorAll('tr');

        // Helper to find column index by header name (handling variations)
        const headers = Array.from(resultRows[0]?.querySelectorAll('td') || []).map(td => td.textContent.toLowerCase().trim());
        const idxCode = headers.findIndex(h => h.includes('subject code'));
        const idxName = headers.findIndex(h => h.includes('subject name'));
        const idxInt = headers.findIndex(h => h.includes('internal'));
        const idxExt = headers.findIndex(h => h.includes('external'));
        const idxTot = headers.findIndex(h => h.includes('total'));
        const idxGrade = headers.findIndex(h => h.includes('grade'));
        const idxCredits = headers.findIndex(h => h.includes('credits'));

        // Skip header
        for (let i = 1; i < resultRows.length; i++) {
            const cols = resultRows[i].querySelectorAll('td');
            if (cols.length > 3) { // Ensure row has data
                const code = idxCode > -1 ? cols[idxCode]?.textContent.trim() : cols[0]?.textContent.trim();
                const subName = idxName > -1 ? cols[idxName]?.textContent.trim() : cols[1]?.textContent.trim();
                const internal = parseInt(idxInt > -1 ? cols[idxInt]?.textContent.trim() : cols[2]?.textContent.trim()) || 0;
                const external = parseInt(idxExt > -1 ? cols[idxExt]?.textContent.trim() : cols[3]?.textContent.trim()) || 0;
                const total = parseInt(idxTot > -1 ? cols[idxTot]?.textContent.trim() : cols[4]?.textContent.trim()) || 0;
                const grade = idxGrade > -1 ? cols[idxGrade]?.textContent.trim() : cols[5]?.textContent.trim();
                const credits = parseFloat(idxCredits > -1 ? cols[idxCredits]?.textContent.trim() : cols[6]?.textContent.trim()) || 0;

                if (code && subName) {
                    subjects.push({
                        code, name: subName, internal, external, total, grade, credits,
                        status: (grade === 'F' || grade === 'Ab') ? 'F' : 'P'
                    });
                }
            }
        }

        // Calculate SGPA
        let totalPoints = 0;
        let totalCredits = 0;
        const gradeMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0, 'Ab': 0 };

        subjects.forEach(s => {
            const pts = gradeMap[s.grade] || 0;
            totalPoints += pts * s.credits;
            totalCredits += s.credits;
        });

        const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

        // Dynamically extract semester from title
        const displaySemester = extractSemester(title);

        const resultData = {
            name,
            hallTicket: htno,
            course,
            semester: displaySemester,
            subjects,
            sgpa,
            totalCredits
        };

        // SAVE LOGIC: Unified File System
        try {
            saveUnifiedResult(htno, dbType, resultData);
        } catch (e) { console.error("File System Save Error:", e); }

        res.json({ success: true, data: resultData });

    } catch (err) {
        console.error('[Official Fetch] Error:', err);
        res.status(500).json({
            success: false,
            error: 'Connection failed. Please check your internet or visit the official JNTUH Results Website.'
        });
    }
});


// --- AUTHENTICATION ROUTES REMOVED ---


// --- RESULTS API ROUTES ---

app.get('/api/status', (req, res) => {
    const list = Object.keys(studentRecords).map(key => ({
        id: key,
        status: studentRecords[key].status,
        name: studentRecords[key].data?.name,
        lastUpdated: studentRecords[key].lastUpdated || 0
    }));
    list.sort((a, b) => b.id.localeCompare(a.id));
    const stats = {
        fetched: list.filter(i => i.status === 'COMPLETED').length,
        failed: list.filter(i => i.status === 'FAILED').length,
        pending: list.filter(i => i.status === 'PENDING' || i.status === 'PROCESSING').length,
        total: list.length
    };
    res.json({ items: list, stats });
});

app.get('/api/result/:htno', (req, res) => {
    const id = req.params.htno.toUpperCase();
    ensureRecord(id);
    const record = studentRecords[id];
    if (record && record.status === 'COMPLETED') {
        res.json({ success: true, data: record.data, source: 'SERVER_CACHE' });
    } else if (record && record.status === 'FAILED') {
        res.status(404).json({ success: false, error: 'Student found but marked as Failed/Invalid' });
    } else {
        res.status(404).json({ success: false, error: 'Result pending in queue', isPending: true });
    }
});

app.get('/api/task', (req, res) => {
    const pendingId = Object.keys(studentRecords).find(key => studentRecords[key].status === 'PENDING');
    if (pendingId) {
        studentRecords[pendingId].status = 'PROCESSING';
        res.json({ task: pendingId });
    } else {
        res.json({ task: null });
    }
});

app.post('/api/update', (req, res) => {
    const { htNo, status, data } = req.body;
    const id = htNo.toUpperCase();
    if (!studentRecords[id]) studentRecords[id] = {};
    studentRecords[id] = {
        status: status,
        data: data || (studentRecords[id].data || null),
        lastUpdated: Date.now()
    };
    saveData();
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`JNTUH Results Backend running on port ${PORT}`);
});
