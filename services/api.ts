
import { StudentResult, SubjectResult, OverallStudentResult, SemesterHistory } from "../types";

// --- CONFIGURATION ---
const LOCAL_API_BASE = `${process.env.BASE_URL}/api`;

// --- CACHE ---
const CACHE: Record<string, any> = {};

// --- HELPER FUNCTIONS ---

const gradeToPoints = (grade: string): number => {
    switch (grade.toUpperCase()) {
        case 'O': return 10;
        case 'A+': return 9;
        case 'A': return 8;
        case 'B+': return 7;
        case 'B': return 6;
        case 'C': return 5;
        default: return 0;
    }
};

const mapSubject = (apiSubject: any): SubjectResult => ({
    code: apiSubject.subjectCode,
    name: apiSubject.subjectName,
    internal: parseInt(apiSubject.internalMarks) || 0,
    external: parseInt(apiSubject.externalMarks) || 0,
    total: parseInt(apiSubject.totalMarks) || 0,
    credits: parseFloat(apiSubject.credits) || 0,
    grade: apiSubject.grades,
    status: (apiSubject.grades === 'F' || apiSubject.grades === 'Ab') ? 'F' : 'P'
});

const fetchFromDhethi = async (rollNumber: string) => {
    if (CACHE[rollNumber]) return CACHE[rollNumber];

    try {
        // Use the local proxy to avoid CORS issues
        const response = await fetch(`${LOCAL_API_BASE}/proxy/dhethi?rollNumber=${rollNumber}`);
        if (!response.ok) {
            // If 404 or other error, assume result not found or API issue
            return null;
        }
        const data = await response.json();
        // Basic validation
        if (!data.results && !data.details) return null;

        CACHE[rollNumber] = data;
        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        return null;
    }
};

// --- CORE EXPORTED API ---

export const fetchExamCodes = async (): Promise<{ success: boolean; exams?: { title: string, code: string }[]; error?: string }> => {
    try {
        const response = await fetch(`${LOCAL_API_BASE}/exam-codes`);
        const data = await response.json();
        return data;
    } catch (e) {
        return { success: false, error: 'Failed to load exams' };
    }
};

export const fetchExamUrls = async (): Promise<{ success: boolean; data?: { title: string, url: string, code: string, date?: string }[]; error?: string }> => {
    try {
        const response = await fetch(`${LOCAL_API_BASE}/exam-urls`);
        const data = await response.json();
        return data;
    } catch (e) {
        return { success: false, error: 'Failed to load exam URLs' };
    }
};

export const fetchOfficialResult = async (htno: string, code: string, title?: string): Promise<{ success: boolean; data?: StudentResult; error?: string }> => {
    try {
        const response = await fetch(`${LOCAL_API_BASE}/fetch-official`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ htno, code, title })
        });
        const data = await response.json();
        return data;
    } catch (e) {
        return { success: false, error: 'Failed to fetch official result' };
    }
};

// Helper to save result to backend
const saveResultToBackend = async (data: any, type: string, identifier?: string) => {
    try {
        await fetch(`${LOCAL_API_BASE}/save-result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data,
                type,
                identifier: identifier || data.hallTicket,
                name: data.name
            })
        });
    } catch (e) {
        console.error("Failed to save result to backend:", e);
    }
};

export const fetchStudentResult = async (htNo: string): Promise<{ success: boolean; data?: OverallStudentResult; error?: string; source?: string }> => {
    // 1. Check for Cached Result in Backend filesystem
    try {
        const cacheRes = await fetch(`${LOCAL_API_BASE}/saved-result?type=OVERALL_RESULTS&id=${htNo}`);
        if (cacheRes.ok) {
            const cachedData = await cacheRes.json();
            if (cachedData && cachedData.success && cachedData.data) {
                return { success: true, data: cachedData.data, source: 'SERVER_FILE_CACHE' };
            }
        }
    } catch (e) { /* Ignore cache check error, proceed to fetch */ }

    const data = await fetchFromDhethi(htNo);

    if (!data || !data.results || data.results.length === 0) {
        return { success: false, error: 'No results found for this Hall Ticket.' };
    }

    // Sort semesters to be in order
    const sortedSemesters = [...data.results].sort((a, b) => {
        // Heuristic sort for "1-1", "1-2" strings
        return a.semester.localeCompare(b.semester);
    });

    const semesterHistories: SemesterHistory[] = [];
    let cumulativePoints = 0;
    let cumulativeCredits = 0;

    for (const semData of sortedSemesters) {
        // MERGE LOGIC: Iterate ALL exams to build a complete subject map
        const exams = semData.exams || [];
        if (exams.length === 0) continue;

        const mergedSubjects: Record<string, SubjectResult> = {};

        // Process exams to merge subjects (latest attempt overrides)
        exams.forEach((exam: any) => {
            const examSubjects = exam.subjects.map(mapSubject);
            examSubjects.forEach(sub => {
                mergedSubjects[sub.code] = sub;
            });
        });

        const subjects = Object.values(mergedSubjects);

        let totalPoints = 0;
        let totalCredits = 0;

        subjects.forEach(sub => {
            const pts = gradeToPoints(sub.grade);
            totalPoints += pts * sub.credits;
            // Always count credits for SGPA unless subject is withdrawn/absent? 
            // Standard JNTUH: Total Points / Total Credits Registered.
            totalCredits += sub.credits;
        });

        const sgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

        semesterHistories.push({
            semester: semData.semester,
            sgpa,
            totalCredits,
            results: subjects
        });

        cumulativePoints += totalPoints;
        cumulativeCredits += totalCredits;
    }

    const cgpa = cumulativeCredits > 0 ? parseFloat((cumulativePoints / cumulativeCredits).toFixed(2)) : 0;

    const overallResult: OverallStudentResult = {
        hallTicket: data.details.rollNumber,
        name: data.details.name,
        course: data.details.branch || 'B.TECH',
        cgpa: cgpa,
        totalCredits: cumulativeCredits,
        semesters: semesterHistories
    };

    // Auto-save this result to backend
    saveResultToBackend(overallResult, 'OVERALL_RESULTS');

    return { success: true, data: overallResult, source: 'NETWORK' };
};



// --- DYNAMIC NEIGHBOR FETCHING ---

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

export const processBackgroundBatch = async (htNos: string[], examCode?: string, examTitle?: string) => {
    // Calculations for pre and post neighbors
    const BATCH_WINDOW = 5; // Fetch 5 before and 5 after

    for (const ht of htNos) {
        if (!ht || ht.length !== 10) continue;

        const prefix = ht.substring(0, 8);
        const suffix = ht.substring(8, 10);
        const centerIndex = SUFFIX_LIST.indexOf(suffix);

        if (centerIndex === -1) continue;

        const neighbors: string[] = [];
        for (let i = 1; i <= BATCH_WINDOW; i++) {
            // Pre
            if (centerIndex - i >= 0) {
                neighbors.push(`${prefix}${SUFFIX_LIST[centerIndex - i]}`);
            }
            // Post
            if (centerIndex + i < SUFFIX_LIST.length) {
                neighbors.push(`${prefix}${SUFFIX_LIST[centerIndex + i]}`);
            }
        }

        console.log(`[Batch] Starting background fetch for ${neighbors.length} neighbors of ${ht} ${examCode ? `(Exam: ${examCode})` : '(Overall)'}`);

        // Fetch each neighbor silently with a small delay to avoid overloading
        for (const neighborHt of neighbors) {
            try {
                if (examCode) {
                    // Fetch specific exam for neighbor (server handles saving)
                    fetchOfficialResult(neighborHt, examCode, examTitle);
                } else {
                    // Fetch overall history for neighbor (server handles saving)
                    fetchStudentResult(neighborHt);
                }
                // Small sleep to spread out requests
                await new Promise(r => setTimeout(r, 100));
            } catch (e) {
                // Silently ignore background errors
            }
        }
    }
};

export const getBatchStatus = async () => {
    // Stub for availability page since we removed the scraping DB.
    // In a real app, this would query our backend for cached records.
    return { items: [], stats: { fetched: 0, failed: 0, total: 0 } };
};

// --- AUTH API REMOVED ---
// All authentication related functionality has been deprecated.
