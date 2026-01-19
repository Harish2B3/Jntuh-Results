
export interface SubjectResult {
  code: string;
  name: string;
  internal: number;
  external: number;
  total: number;
  credits: number;
  grade: string;
  status: 'P' | 'F';
}

export interface StudentResult {
  hallTicket: string;
  name: string;
  course: string;
  semester: string;
  subjects: SubjectResult[];
  sgpa: number;
  totalCredits: number;
}

export interface SemesterHistory {
  semester: string;
  sgpa: number;
  totalCredits: number;
  results: SubjectResult[];
}

export interface OverallStudentResult {
  hallTicket: string;
  name: string;
  course: string;
  cgpa: number;
  totalCredits: number;
  semesters: SemesterHistory[];
}

export interface Notification {
  id: string;
  title: string;
  date: string;
  isNew: boolean;
  link: string;
}

export interface User {
  email: string;
  name: string;
  hallTicket?: string;
}
