import { StudentResult } from "../types";

const DB_STORAGE_KEY = 'jntuh_results_status_db';

// Initial Seed Data to populate Client's Local Storage for demonstration
const SEED_DATA: Record<string, { status: string, name?: string }> = {
  '22N81A6201': { status: 'FETCHED', name: 'AARAV SHARMA' },
  '22N81A6205': { status: 'FETCHED', name: 'DIVYA REDDY' },
  '22N81A6212': { status: 'FETCHED', name: 'K. SAI TEJA' },
  '22N81A6223': { status: 'FETCHED', name: 'MOHAMMED ALI' },
  '22N81A6245': { status: 'FETCHED', name: 'PRIYA SINGH' },
  '22N81A6256': { status: 'FETCHED', name: 'RAHUL VERMA' },
  '22N81A6299': { status: 'FAILED' }, // Example of a failed fetch
};

// Ensure Local Storage has some data on first load to simulate a client that has been active
const initializeDatabase = () => {
  try {
    const existing = localStorage.getItem(DB_STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(SEED_DATA));
    }
  } catch (e) {
    console.error("Storage initialization failed", e);
  }
};

initializeDatabase();

// --- AUTH METHODS REMOVED ---

// Backend Process: Verify and Mark as Successfully Fetched
export const markResultAsFetched = (htNo: string, name: string) => {
  try {
    const db = JSON.parse(localStorage.getItem(DB_STORAGE_KEY) || '{}');
    db[htNo.toUpperCase()] = { status: 'FETCHED', name: name };
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to update local status DB", e);
  }
};

// Backend Process: Verify and Mark as Unable to Fetch (Invalid or Error)
export const markResultAsFailed = (htNo: string) => {
  try {
    const db = JSON.parse(localStorage.getItem(DB_STORAGE_KEY) || '{}');
    db[htNo.toUpperCase()] = { status: 'FAILED' };
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to mark result as failed", e);
  }
};

export const getBatchAvailability = (page: number = 1, limit: number = 50, query: string = '') => {
  const ids: Array<{ id: string, status: string, name?: string }> = [];
  const prefix = "22N81A62";

  // 1. READ FROM CLIENT RESOURCE (Local Storage) - Simulating Distributed Node Data
  let storedDB: Record<string, any> = {};
  try {
    storedDB = JSON.parse(localStorage.getItem(DB_STORAGE_KEY) || '{}');
  } catch (e) {
    console.error("Error reading status DB", e);
  }

  const addRange = (start: number, end: number, suffixPrefix: string = "") => {
    for (let i = start; i <= end; i++) {
      let suffix = "";
      if (suffixPrefix === "") {
        suffix = i.toString().padStart(2, '0');
      } else {
        suffix = suffixPrefix + i.toString();
      }

      const ht = prefix + suffix;
      const stored = storedDB[ht];

      // Status State Machine Logic
      if (stored) {
        const status = typeof stored === 'string' ? stored : stored.status;
        const name = typeof stored === 'object' ? stored.name : '';

        if (status === 'FAILED') {
          ids.push({ id: ht, status: 'FAILED' });
        } else {
          ids.push({ id: ht, status: 'FETCHED', name });
        }
      } else {
        // Default to PENDING (Needed to be fetched)
        ids.push({ id: ht, status: 'PENDING' });
      }
    }
  };

  // Generate Roll Number List
  addRange(1, 99);
  addRange(0, 9, "A");
  addRange(0, 9, "B");
  addRange(0, 8, "C");

  // Backend Process: Calculate Statistics for the verification dashboard
  const stats = {
    fetched: 0,
    pending: 0,
    failed: 0,
    total: ids.length
  };

  ids.forEach(item => {
    if (item.status === 'FETCHED') stats.fetched++;
    else if (item.status === 'FAILED') stats.failed++;
    else stats.pending++;
  });

  // Filtering Logic
  let filteredIds = ids;
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredIds = ids.filter(item =>
      item.id.toLowerCase().includes(lowerQuery) ||
      (item.name && item.name.toLowerCase().includes(lowerQuery))
    );
  }

  // Pagination Logic
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = filteredIds.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: filteredIds.length,
    totalPages: Math.ceil(filteredIds.length / limit),
    currentPage: page,
    stats // Return verified stats
  };
};