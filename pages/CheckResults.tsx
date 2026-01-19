
import React, { useState, useEffect } from 'react';
import {
    Search, RotateCcw, Download, Share2, AlertCircle,
    CheckCircle, Database, Globe, History, Layout, BookOpen,
    Award, ChevronRight, Home, GraduationCap, Calendar,
    FileText, Briefcase, Bell, HelpCircle, ChevronDown, ListFilter,
    Link as LinkIcon, Printer, XCircle, ArrowLeftRight, Scale,
    TrendingUp, Shield, Zap, Heart, Quote, Plus, Trash2,
    Users, Hash
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { StudentResult, OverallStudentResult } from '../types';
import { fetchStudentResult, processBackgroundBatch, fetchExamCodes, fetchOfficialResult, fetchExamUrls } from '../backend/api';

export const CheckResults: React.FC = () => {
    const { htNo } = useParams<{ htNo: string }>();
    const [hallTicket, setHallTicket] = useState('');
    const [result, setResult] = useState<OverallStudentResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [source, setSource] = useState<'CACHE' | 'NETWORK' | null>(null);

    // Navigation State
    const [sidebarActive, setSidebarActive] = useState('Semester Results');
    const [isResultsOpen, setIsResultsOpen] = useState(true);

    // Semester Results Tab State
    const [examCodes, setExamCodes] = useState<{ title: string, code: string }[]>([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedRegulation, setSelectedRegulation] = useState('ALL');
    const [officialResult, setOfficialResult] = useState<StudentResult | null>(null);
    const [officialLoading, setOfficialLoading] = useState(false);
    const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
    const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);
    const [examSearch, setExamSearch] = useState('');

    // Results Comparison & Advanced States
    const [contrastHTs, setContrastHTs] = useState<string[]>(['']);
    const [comparisonData, setComparisonData] = useState<OverallStudentResult[]>([]);
    const [isRevealingStatus, setIsRevealingStatus] = useState(false);
    const [revealResult, setRevealResult] = useState<'PASS' | 'FAIL' | null>(null);

    // Load Exam Codes on Mount
    useEffect(() => {
        const loadExams = async () => {
            const res = await fetchExamUrls();
            if (res.success && res.data) {
                setExamCodes(res.data);
            } else {
                const resOld = await fetchExamCodes();
                if (resOld.success && resOld.exams) {
                    setExamCodes(resOld.exams);
                }
            }
        };
        loadExams();
    }, []);

    const handleFetch = async (ht: string) => {
        setLoading(true);
        setError('');
        setResult(null);
        setSource(null);

        try {
            const response = await fetchStudentResult(ht);
            if (response.success && response.data) {
                setResult(response.data);
                setSource(response.source === 'SERVER_CACHE' ? 'CACHE' : 'NETWORK');
                processBackgroundBatch([ht]);
            } else {
                setError(response.error || 'Result not found');
            }
        } catch (e) {
            setError('System Error: Unable to process request');
        } finally {
            setLoading(false);
        }
    };

    const handleOfficialFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hallTicket || hallTicket.length < 10) {
            setError('Please enter a valid 10-digit Hall Ticket Number');
            return;
        }
        if (!selectedExam) {
            setError('Please select an examination');
            return;
        }

        setOfficialLoading(true);
        setError('');
        setOfficialResult(null);

        try {
            const selectedExamObj = examCodes.find(e => e.code === selectedExam);
            const examTitle = selectedExamObj ? selectedExamObj.title : 'OFFICIAL';

            const res = await fetchOfficialResult(hallTicket, selectedExam, examTitle);
            if (res.success && res.data) {
                setOfficialResult(res.data);
                processBackgroundBatch([hallTicket], selectedExam, examTitle);
            } else {
                setError(res.error || 'Failed to fetch official result. Please verify details.');
            }
        } catch (err) {
            setError('Connection error with JNTUH servers.');
        } finally {
            setOfficialLoading(false);
        }
    };

    useEffect(() => {
        if (htNo) {
            setHallTicket(htNo);
            setSidebarActive('OverAll Results');
            handleFetch(htNo);
        }
    }, [htNo]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hallTicket || hallTicket.length < 10) {
            setError('Please enter a valid 10-digit Hall Ticket Number');
            return;
        }
        handleFetch(hallTicket);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleRevealStatus = async (ht: string) => {
        setIsRevealingStatus(true);
        setRevealResult(null);
        setLoading(true);
        setError('');

        try {
            const res = await fetchStudentResult(ht);
            if (res.success && res.data) {
                const hasFail = res.data.semesters.some(sem => sem.results.some(s => s.status === 'F'));
                setRevealResult(hasFail ? 'FAIL' : 'PASS');
                setResult(res.data);
            } else {
                setError(res.error || 'Result not found');
            }
        } catch (e) {
            setError('Error fetching status');
        } finally {
            setLoading(false);
            setTimeout(() => setIsRevealingStatus(false), 3000);
        }
    };

    const handleContrastSearch = async () => {
        setLoading(true);
        setError('');
        const results: OverallStudentResult[] = [];
        try {
            for (const ht of contrastHTs) {
                if (ht.length >= 10) {
                    const res = await fetchStudentResult(ht);
                    if (res.success && res.data) results.push(res.data);
                }
            }
            setComparisonData(results);
        } catch (e) {
            setError('Error comparing results');
        } finally {
            setLoading(false);
        }
    };

    const sidebarItems = [
        {
            name: 'Results',
            icon: <GraduationCap className="w-5 h-5" />,
            isDropdown: true,
            subItems: [
                'Semester Results',
                'OverAll Results',
                'Pass or Fail Status',
                'Manage Backlogs',
                'Results Contrast'
            ]
        },
    ];

    const motivationalQuotes = [
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Your grades don't define your future, your character and hard work do.",
        "Failure is simply the opportunity to begin again, this time more intelligently.",
        "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
        "It's not about how many times you fall, but how many times you get back up.",
        "The only limit to our realization of tomorrow will be our doubts of today."
    ];

    const getQuote = () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    const renderResultView = (data: StudentResult) => (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"></div>
            <div className="p-5 md:p-8 pb-4 flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                <div className="flex-1">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold uppercase tracking-wider mb-4">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {data.semester}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-3 uppercase">{data.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-bold text-slate-500">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-mono border border-slate-200">
                            {data.hallTicket}
                        </span>
                        <span className="hidden md:inline text-slate-300">|</span>
                        <span className="text-slate-600 uppercase tracking-tight text-xs md:text-sm">{data.course}</span>
                    </div>
                </div>
                <div className="flex md:flex-col items-center md:items-end gap-3 w-full md:w-auto flex-shrink-0">
                    <button onClick={handlePrint} className="p-3 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm print:hidden">
                        <Printer className="w-5 h-5" />
                    </button>
                    <div className="bg-slate-900 text-white p-4 md:p-5 rounded-xl min-w-[100px] md:min-w-[120px] text-center shadow-lg relative overflow-hidden flex-1 md:flex-none">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SGPA</div>
                        <div className="text-2xl md:text-3xl font-black">{data.sgpa.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            <div className="mt-4 mx-5 md:mx-8 pb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 border-b border-slate-100">
                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-slate-900">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Credits</p>
                    <p className="text-lg md:text-xl font-black text-slate-800">{data.totalCredits}</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-slate-900">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Subject Count</p>
                    <p className="text-lg md:text-xl font-black text-slate-800">{data.subjects.length}</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-slate-900">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Pass Count</p>
                    <p className="text-lg md:text-xl font-black text-emerald-600">{data.subjects.filter(s => s.status === 'P').length}</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-slate-900">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Fail Count</p>
                    <p className="text-lg md:text-xl font-black text-rose-600">{data.subjects.filter(s => s.status === 'F').length}</p>
                </div>
            </div>
            <div className="p-4 md:p-8">
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Subject Details</th>
                                <th className="px-4 md:px-6 py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Int</th>
                                <th className="px-4 md:px-6 py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Ext</th>
                                <th className="px-4 md:px-6 py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Total</th>
                                <th className="px-4 md:px-6 py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Grade</th>
                                <th className="px-4 md:px-6 py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {data.subjects.map((sub, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 md:px-6 py-4 min-w-[150px] md:w-1/3">
                                        <div className="text-xs md:text-sm font-bold text-slate-800 leading-tight">{sub.name}</div>
                                        <div className="text-[9px] md:text-[10px] font-bold text-slate-400 font-mono mt-1 bg-slate-100 inline-block px-1.5 rounded">{sub.code}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 text-center">{sub.internal}</td>
                                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 text-center">{sub.external}</td>
                                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-black text-slate-800 text-center">{sub.total}</td>
                                    <td className="px-4 md:px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 text-[10px] md:text-xs font-black rounded-xl border-2 ${['O', 'A+', 'A'].includes(sub.grade) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            ['F', 'Ab'].includes(sub.grade) ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                            {sub.grade}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-center">
                                        <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider ${sub.status === 'P' ? 'bg-emerald-100/50 text-emerald-700' : 'bg-rose-100/50 text-rose-700'}`}>
                                            {sub.status === 'P' ? 'PASS' : 'FAIL'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderOverallView = (data: OverallStudentResult) => (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500"></div>
            <div className="p-5 md:p-8 pb-4 flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                <div className="flex-1">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider mb-4">
                        <Database className="w-3 h-3 mr-1.5" />
                        Comprehensive Record
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-3 uppercase">{data.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-bold text-slate-500">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-mono border border-slate-200">{data.hallTicket}</span>
                        <span className="hidden md:inline text-slate-300">|</span>
                        <span className="text-slate-600 uppercase tracking-tight text-xs md:text-sm">{data.course}</span>
                        <span className="hidden md:inline text-slate-300">|</span>
                        <span className="text-emerald-600 font-black text-xs md:text-sm">{data.semesters.length} Semesters</span>
                    </div>
                </div>
                <div className="flex md:flex-col items-center md:items-end gap-3 w-full md:w-auto flex-shrink-0">
                    <button onClick={handlePrint} className="p-3 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm print:hidden">
                        <Printer className="w-5 h-5" />
                    </button>
                    <div className="bg-slate-900 text-white p-4 md:p-5 rounded-xl min-w-[100px] md:min-w-[120px] text-center shadow-lg relative overflow-hidden flex-1 md:flex-none">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CGPA</div>
                        <div className="text-2xl md:text-3xl font-black">{data.cgpa.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            <div className="mt-4 mx-5 md:mx-8 pb-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 border-b border-slate-100">
                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-slate-900">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Credits</p>
                    <p className="text-lg md:text-xl font-black text-slate-800">{data.totalCredits}</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-slate-900">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Pass % Approx.</p>
                    <p className="text-lg md:text-xl font-black text-emerald-600">
                        {Math.round((data.semesters.reduce((acc, sem) => acc + sem.results.filter(s => s.status === 'P').length, 0) /
                            Math.max(1, data.semesters.reduce((acc, sem) => acc + sem.results.length, 0))) * 100)}%
                    </p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-slate-900 col-span-2 md:col-span-1">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Backlogs (Active)</p>
                    <p className="text-lg md:text-xl font-black text-rose-600">
                        {data.semesters.reduce((acc, sem) => acc + sem.results.filter(s => s.status === 'F').length, 0)}
                    </p>
                </div>
            </div>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                {data.semesters.map((sem, sIdx) => (
                    <div key={sIdx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-4 md:px-6 py-3 border-b-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 md:gap-3 text-sm md:text-lg uppercase">
                                <span className="w-1.5 h-4 md:h-6 bg-rose-500 rounded-full"></span>
                                {sem.semester}
                            </h3>
                            <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="font-bold text-slate-500 text-[10px] md:text-sm">SGPA: <span className="text-slate-900 text-xs md:text-base">{sem.sgpa.toFixed(2)}</span></span>
                                <span className="px-2 md:px-3 py-1 bg-white border-2 border-slate-300 rounded text-[9px] md:text-xs text-slate-600 font-black tracking-tighter sm:tracking-normal">{sem.totalCredits} CREDITS</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                                        <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                                        <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                                        <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {sem.results.map((sub, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-bold text-slate-700">{sub.name}</div>
                                                <div className="text-[9px] text-slate-400 font-mono">{sub.code}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-600 text-center">{sub.total}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block w-6 h-6 leading-6 text-[10px] font-bold rounded-lg ${['O', 'A+', 'A'].includes(sub.grade) ? 'bg-emerald-50 text-emerald-600' :
                                                    ['F', 'Ab'].includes(sub.grade) ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {sub.grade}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[10px] font-black uppercase ${sub.status === 'P' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {sub.status === 'P' ? 'PASS' : 'FAIL'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPassFailStatusView = () => {
        const passQuotes = [
            "The future belongs to those who believe in the beauty of their dreams.",
            "Success is the sum of small efforts, repeated day in and day out.",
            "Your hard work has paid off. The sky is the limit!",
            "Excellence is not a skill, it is an attitude. Keep it up!",
            "This is just the beginning of your greatness."
        ];
        const failQuotes = [
            "A setback is just a setup for a comeback. You've got this!",
            "Failure is the condiment that gives success its flavor.",
            "Success consists of going from failure to failure without loss of enthusiasm.",
            "It's not about how hard you hit, it's about how hard you can get hit and keep moving forward.",
            "The only real mistake is the one from which we learn nothing."
        ];

        const currentQuote = revealResult === 'PASS'
            ? passQuotes[Math.floor(Math.random() * passQuotes.length)]
            : failQuotes[Math.floor(Math.random() * failQuotes.length)];

        return (
            <div className="space-y-6 max-h-full">
                {/* Horizontal Line Header */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-6 border-b-2 border-slate-100">
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="w-1.5 h-8 bg-slate-900 rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase whitespace-nowrap">Pass or Fail</h2>
                    </div>
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleRevealStatus(hallTicket); }}
                        className="w-full lg:flex-1 max-w-sm relative group"
                    >
                        <input
                            type="text"
                            className="w-full pl-5 pr-28 py-3 bg-white border-2 border-slate-200 rounded-xl font-black uppercase tracking-widest outline-none focus:border-slate-900 transition-all text-xs md:text-sm"
                            placeholder="HTNO"
                            value={hallTicket}
                            onChange={(e) => setHallTicket(e.target.value.toUpperCase())}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 md:px-6 bg-slate-900 text-white rounded-lg font-bold text-[9px] md:text-[10px] hover:bg-slate-800 transition-all active:scale-95"
                        >
                            {loading ? '...' : 'REVEAL'}
                        </button>
                    </form>
                </div>

                {/* Status Reveal Screen - Full Width, Low-Profile Animated Banner */}
                {isRevealingStatus && (
                    <div className="h-24 bg-slate-900 rounded-2xl flex items-center justify-center animate-in fade-in overflow-hidden shadow-lg relative">
                        <div className="absolute inset-0 opacity-10 flex space-x-2">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="h-full w-px bg-white animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <Zap className="w-5 h-5 text-rose-500 animate-bounce" />
                            <div className="text-left">
                                <h2 className="text-lg font-black text-white tracking-widest uppercase mb-0.5">Analyzing Results....</h2>
                                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 animate-progress"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {revealResult && !isRevealingStatus && (
                    <div className="animate-in slide-in-from-top-2 duration-700 w-full">
                        <div className={`p-4 rounded-[1.5rem] bg-white border-2 shadow-lg ${revealResult === 'PASS' ? 'border-emerald-100' : 'border-rose-100'} relative overflow-hidden flex flex-col lg:flex-row items-center justify-between px-6 gap-6`}>
                            {/* Accent line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${revealResult === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                            {/* Main Result & Quote Section */}
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${revealResult === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'} text-white shadow-lg shadow-current/20`}>
                                    {revealResult === 'PASS' ? <Award className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                    <h3 className={`text-xl font-black ${revealResult === 'PASS' ? 'text-emerald-600' : 'text-rose-600'} leading-none tracking-tight uppercase`}>
                                        {revealResult === 'PASS' ? 'ALL CLEAR' : 'BACKLOGS FOUND'}
                                    </h3>
                                    <p className="text-slate-500 font-bold text-[10px] md:text-xs italic mt-2 leading-relaxed">
                                        "{currentQuote}"
                                    </p>
                                </div>
                            </div>

                            {/* Divider for Desktop */}
                            <div className="hidden lg:block h-10 w-px bg-slate-100"></div>

                            {/* Summary Stats Section */}
                            <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-center px-4 border-r border-slate-50">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CGPA</p>
                                    <p className="text-2xl font-black text-slate-800 leading-none">{result?.cgpa.toFixed(2)}</p>
                                </div>
                                <div className="text-center min-w-[90px]">
                                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${revealResult === 'FAIL' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {revealResult === 'FAIL' ? 'FAIL COUNT' : 'STATUS'}
                                    </p>
                                    <p className={`text-2xl font-black leading-none ${revealResult === 'FAIL' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {revealResult === 'FAIL' ? result?.semesters.reduce((acc, sem) => acc + sem.results.filter(s => s.status === 'F').length, 0) : 'PASS'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {revealResult && !isRevealingStatus && result && (
                    <div className="animate-in fade-in duration-1000 delay-300 w-full">
                        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <ListFilter className="w-4 h-4 text-rose-500" />
                                    Semester Wise Status
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Semester</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Backlogs</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">GPA</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Result Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {result.semesters.map((sem, idx) => {
                                            const backlogCount = sem.results.filter(s => s.status === 'F').length;
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase">{sem.semester}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-[11px] font-black ${backlogCount > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                                                            {backlogCount > 0 ? backlogCount : '0'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[11px] font-bold text-slate-600 text-center">{sem.sgpa.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase ${backlogCount === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {backlogCount === 0 ? 'PASSED' : 'FAILED'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderBacklogView = () => {
        const backlogs = result?.semesters.flatMap(sem => sem.results.filter(s => s.status === 'F').map(s => ({ ...s, semester: sem.semester }))) || [];
        return (
            <div className="space-y-8">
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 p-5 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center justify-center lg:justify-start gap-3"><XCircle className="w-6 h-6 md:w-7 md:h-7 text-rose-500" />Backlog Manager</h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">Detailed breakdown of pending subjects.</p>
                    </div>
                    <form onSubmit={handleSearch} className="w-full lg:flex-1 max-w-sm relative group">
                        <input type="text" className="w-full pl-5 pr-24 py-3 border-2 border-slate-100 rounded-xl bg-slate-50 font-bold outline-none uppercase text-sm" placeholder="HTNO" value={hallTicket} onChange={(e) => setHallTicket(e.target.value.toUpperCase())} />
                        <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 text-white rounded-lg font-bold text-[10px]">SCAN</button>
                    </form>
                    <div className="bg-rose-50 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] border-2 border-rose-100 text-center min-w-[100px] md:min-w-[120px]">
                        <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1">Active Counts</p>
                        <p className="text-2xl md:text-3xl font-black text-rose-600">{result ? backlogs.length : '--'}</p>
                    </div>
                </div>
                {!result ? (
                    <div className="p-12 md:p-16 bg-white rounded-[1.5rem] md:rounded-[2rem] text-center text-slate-400 font-bold border border-slate-100 shadow-sm text-sm">Enter Hall Ticket to analyze backlogs</div>
                ) : backlogs.length > 0 ? (
                    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Semester</th>
                                        <th className="px-4 md:px-6 py-4 text-left text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                                        <th className="px-4 md:px-6 py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Code</th>
                                        <th className="px-4 md:px-6 py-4 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {backlogs.map((sub, idx) => (
                                        <tr key={idx} className="hover:bg-rose-50/30">
                                            <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-bold text-slate-700 whitespace-nowrap">{sub.semester}</td>
                                            <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-bold text-slate-800 min-w-[200px]">{sub.name}</td>
                                            <td className="px-4 md:px-6 py-4 text-center font-mono text-[10px] md:text-xs text-slate-400">{sub.code}</td>
                                            <td className="px-4 md:px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[8px] md:text-[10px] font-black uppercase">FAILED</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 rounded-[2.5rem] border-4 border-dashed border-emerald-200 p-20 text-center text-emerald-700 font-bold">Perfect Record! No backlogs found.</div>
                )}
            </div>
        );
    };

    const renderContrastView = () => {
        // 1. Identify all unique semesters across all compared students
        const getAllSemesters = () => {
            const sems = new Set<string>();
            comparisonData.forEach(res => res.semesters.forEach(s => sems.add(s.semester)));
            return Array.from(sems).sort();
        };

        const allSemesters = getAllSemesters();

        // 2. Map subjects to semesters
        const subjectsBySemester: Record<string, { code: string, name: string }[]> = {};
        allSemesters.forEach(semName => {
            const subjectMap = new Map<string, string>();
            comparisonData.forEach(res => {
                const sem = res.semesters.find(s => s.semester === semName);
                if (sem) {
                    sem.results.forEach(sub => {
                        subjectMap.set(sub.code, sub.name);
                    });
                }
            });
            subjectsBySemester[semName] = Array.from(subjectMap.entries()).map(([code, name]) => ({ code, name }));
        });

        return (
            <div className="space-y-8 pb-10">
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3"><ArrowLeftRight className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />Contrast Matrix</h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">Side-by-side performance comparison.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => setContrastHTs([...contrastHTs, ''])} className="flex-1 md:flex-none p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center"><Plus className="w-5 h-5 md:w-6 md:h-6" /></button>
                        <button onClick={handleContrastSearch} className={`flex-[3] md:flex-none px-6 md:px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:shadow-lg transition-all ${loading ? 'opacity-70' : ''}`}>
                            {loading ? 'SYNCING...' : 'SYNC & COMPARE'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {contrastHTs.map((ht, idx) => (
                        <div key={idx} className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[9px] md:text-[10px] flex-shrink-0">#{idx + 1}</div>
                            <input type="text" className="flex-1 px-3 md:px-4 py-1.5 md:py-2 bg-slate-50 border-none rounded-lg md:rounded-xl font-bold uppercase placeholder-slate-300 text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="HTNO" value={ht} onChange={(e) => {
                                const newHTs = [...contrastHTs];
                                newHTs[idx] = e.target.value.toUpperCase();
                                setContrastHTs(newHTs);
                            }} />
                            {contrastHTs.length > 1 && <button onClick={() => setContrastHTs(contrastHTs.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>}
                        </div>
                    ))}
                </div>

                {comparisonData.length > 0 && (
                    <div className="bg-white rounded-[1.25rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-indigo-100/50 relative">
                        <div className="overflow-x-auto custom-scrollbar no-scrollbar">
                            <table className="w-full text-left border-collapse min-w-max">
                                <thead>
                                    <tr className="bg-slate-900">
                                        <th className="sticky left-0 z-20 bg-slate-900 px-3 md:px-8 py-4 md:py-7 text-[8px] md:text-[11px] font-black uppercase tracking-wider md:tracking-[0.2em] text-slate-400 w-24 md:w-1/4 border-r border-slate-800 shadow-[2px_0_8px_rgba(0,0,0,0.2)]">
                                            Index
                                        </th>
                                        {comparisonData.map((res, i) => (
                                            <th key={i} className="px-3 md:px-8 py-4 md:py-7 text-center border-l border-slate-800 min-w-[100px] md:min-w-[200px]">
                                                <div className="text-[10px] md:text-sm font-black text-white tracking-tight">{res.name.split(' ')[0]}</div>
                                                <div className="text-[8px] md:text-[10px] font-bold text-indigo-400 mt-0.5 uppercase tracking-widest">{res.hallTicket.slice(-3)}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {/* --- OVERALL METRICS --- */}
                                    <tr className="group">
                                        <td className="sticky left-0 z-10 bg-slate-50 px-3 md:px-8 py-3 md:py-5 text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                            CGPA
                                        </td>
                                        {comparisonData.map((res, i) => (
                                            <td key={i} className="px-4 md:px-8 py-4 md:py-5 text-center border-l border-slate-100 group-hover:bg-slate-50/50 transition-colors">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600">
                                                        {res.cgpa.toFixed(2)}
                                                    </span>
                                                    <div className="w-8 md:w-10 h-1 bg-indigo-100 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-indigo-500" style={{ width: `${(res.cgpa / 10) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="group">
                                        <td className="sticky left-0 z-10 bg-slate-50 px-3 md:px-8 py-3 md:py-5 text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                            Backlogs
                                        </td>
                                        {comparisonData.map((res, i) => {
                                            const bl = res.semesters.reduce((acc, sem) => acc + sem.results.filter(s => s.status === 'F').length, 0);
                                            return (
                                                <td key={i} className="px-4 md:px-8 py-4 md:py-5 text-center border-l border-slate-100 group-hover:bg-slate-50/50 transition-colors">
                                                    <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-sm font-black whitespace-nowrap ${bl > 0 ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'}`}>
                                                        {bl > 0 ? `${bl} FAILED` : 'ALL CLEAR'}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* --- SEMESTER DATA --- */}
                                    {allSemesters.map(semName => (
                                        <React.Fragment key={semName}>
                                            {/* Semester SGPA Row */}
                                            <tr className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-inner">
                                                <td className="sticky left-0 z-10 bg-inherit px-3 md:px-8 py-2 md:py-4 text-[8px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] border-r border-white/10 shadow-[2px_0_10px_rgba(0,0,0,0.2)]">
                                                    {semName.split(' ')[0]}
                                                </td>
                                                {comparisonData.map((res, i) => {
                                                    const sem = res.semesters.find(s => s.semester === semName);
                                                    return (
                                                        <td key={i} className="px-4 md:px-8 py-3 md:py-4 text-center border-l border-white/10">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-lg md:text-xl font-black">{sem ? sem.sgpa.toFixed(2) : '--'}</span>
                                                                <span className="text-[7px] md:text-[8px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5">SGPA</span>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            {/* Subjects in this semester */}
                                            {subjectsBySemester[semName].map(subj => (
                                                <tr key={subj.code} className="group transition-colors duration-200">
                                                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-3 md:px-8 py-2 md:py-4 border-r border-slate-100 shadow-[2px_0_8px_rgba(0,0,0,0.03)] transition-colors">
                                                        <div className="max-w-[70px] md:max-w-[180px]">
                                                            <div className="text-[9px] md:text-[11px] font-black text-slate-800 leading-tight uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 md:line-clamp-none">{subj.name}</div>
                                                            <div className="text-[7px] md:text-[9px] font-mono font-bold text-slate-400 mt-0.5 flex items-center gap-1 md:gap-2">
                                                                <Hash className="w-2 h-2 md:w-3 md:h-3" /> {subj.code.slice(-3)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {comparisonData.map((res, i) => {
                                                        const sem = res.semesters.find(s => s.semester === semName);
                                                        const result = sem?.results.find(r => r.code === subj.code);
                                                        return (
                                                            <td key={i} className="px-4 md:px-8 py-3 md:py-4 text-center border-l border-slate-100 group-hover:bg-indigo-50/20 transition-colors">
                                                                {result ? (
                                                                    <div className="flex flex-col items-center relative group/cell">
                                                                        <div className="flex items-center gap-1.5 md:gap-2">
                                                                            <span className={`text-sm md:text-base font-black ${result.status === 'F' ? 'text-rose-500' : 'text-slate-800 group-hover/cell:scale-110 transition-transform'}`}>
                                                                                {result.total}
                                                                            </span>
                                                                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${result.status === 'F' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                                                        </div>
                                                                        <span className={`text-[8px] md:text-[10px] font-black mt-0.5 px-1.5 md:px-2 py-0.5 rounded ${['O', 'A+', 'A'].includes(result.grade) ? 'bg-emerald-100 text-emerald-700' : result.status === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                            {result.grade}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-center italic text-slate-200 text-[10px] font-bold">---</div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans">
            <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-auto md:h-full flex-shrink-0 z-20">
                <div className="p-4 md:p-5 flex md:flex-col overflow-x-auto md:overflow-y-auto custom-scrollbar no-scrollbar">
                    <nav className="flex md:flex-col gap-2 md:space-y-3 w-full">
                        {sidebarItems.map((item) => (
                            <div key={item.name} className="flex-shrink-0 md:w-full">
                                <button
                                    onClick={() => { if (item.isDropdown) setIsResultsOpen(!isResultsOpen); else setSidebarActive(item.name); }}
                                    className={`flex items-center justify-between px-4 py-2.5 md:py-3 rounded-xl transition-all duration-200 group whitespace-nowrap md:whitespace-normal ${(!item.isDropdown && sidebarActive === item.name) || (item.isDropdown && isResultsOpen) ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className={`${(!item.isDropdown && sidebarActive === item.name) || (item.isDropdown && isResultsOpen) ? 'text-rose-500' : 'text-slate-400 group-hover:text-slate-600'}`}>{item.icon}</span>
                                        <span className="text-xs md:text-sm tracking-wide">{item.name}</span>
                                    </div>
                                    <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform duration-300 ${isResultsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {item.isDropdown && isResultsOpen && (
                                    <div className="hidden md:block pl-11 pr-2 mt-1 space-y-1 relative">
                                        <div className="absolute left-6 top-0 bottom-4 w-px bg-slate-200"></div>
                                        {item.subItems?.map((sub) => (
                                            <button key={sub} onClick={() => setSidebarActive(sub)} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all relative ${sidebarActive === sub ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>{sub}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
                {/* Mobile Submenu (only visible when Sidebar active is part of dropdown) */}
                <div className="md:hidden flex overflow-x-auto custom-scrollbar no-scrollbar px-4 pb-3 gap-2 border-t border-slate-50 pt-2">
                    {sidebarItems[0].subItems?.map((sub) => (
                        <button
                            key={sub}
                            onClick={() => setSidebarActive(sub)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${sidebarActive === sub ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 border border-slate-200'}`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-slate-50/50">
                <div className="max-w-5xl mx-auto space-y-8">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center text-sm font-bold animate-pulse">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {sidebarActive === 'Semester Results' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-10 print:hidden">
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
                                    <span className="bg-rose-100 p-2 rounded-lg text-rose-600"><Globe className="w-5 h-5" /></span>
                                    Semester Wise Results
                                </h2>
                                <form onSubmit={handleOfficialFetch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="w-full">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Regulation</label>
                                        <div className="relative">
                                            <div
                                                onClick={() => setIsRegDropdownOpen(!isRegDropdownOpen)}
                                                className={`flex items-center justify-between w-full px-4 py-3 md:py-4 text-sm border-2 rounded-2xl bg-slate-50 cursor-pointer transition-all ${isRegDropdownOpen ? 'border-rose-400 bg-white ring-4 ring-rose-500/10' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <div className="flex-1 truncate font-bold text-slate-700">
                                                    {selectedRegulation === 'ALL' ? 'All Regulations' : selectedRegulation}
                                                </div>
                                                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isRegDropdownOpen ? 'rotate-180' : ''}`} />
                                            </div>

                                            {isRegDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-50 text-sm" onClick={() => setIsRegDropdownOpen(false)}></div>
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                            <div
                                                                onClick={() => { setSelectedRegulation('ALL'); setSelectedExam(''); setIsRegDropdownOpen(false); }}
                                                                className={`px-4 py-3 hover:bg-rose-50 cursor-pointer transition-colors border-b border-slate-50 font-bold text-sm ${selectedRegulation === 'ALL' ? 'text-rose-600 bg-rose-50/50' : 'text-slate-600'}`}
                                                            >
                                                                All Regulations
                                                            </div>
                                                            {['R22', 'R18', 'R17', 'R16', 'R15', 'R13'].map(reg => (
                                                                <div
                                                                    key={reg}
                                                                    onClick={() => { setSelectedRegulation(reg); setSelectedExam(''); setIsRegDropdownOpen(false); }}
                                                                    className={`px-4 py-3 hover:bg-rose-50 cursor-pointer transition-colors border-b border-slate-50 font-bold text-sm last:border-0 ${selectedRegulation === reg ? 'text-rose-600 bg-rose-50/50' : 'text-slate-600'}`}
                                                                >
                                                                    {reg}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Examination</label>
                                        <div className="relative">
                                            <div
                                                onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
                                                className={`flex items-center justify-between w-full px-4 py-3 md:py-4 text-sm border-2 rounded-2xl bg-slate-50 cursor-pointer transition-all ${isExamDropdownOpen ? 'border-rose-400 bg-white ring-4 ring-rose-500/10' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <div className="flex-1 truncate font-bold text-slate-700 text-left">
                                                    {selectedExam ? (examCodes.find(e => e.code === selectedExam)?.title || 'Select Exam') : 'Select Exam'}
                                                </div>
                                                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
                                            </div>

                                            {isExamDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-50" onClick={() => setIsExamDropdownOpen(false)}></div>
                                                    <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 w-[100%] md:w-[200%] max-w-[calc(100vw-3rem)] md:max-w-[min(600px,calc(100vw-2rem))] lg:max-w-[700px]">
                                                        <div className="p-3 border-b border-slate-50">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search exams..."
                                                                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-slate-800"
                                                                    value={examSearch}
                                                                    onChange={(e) => setExamSearch(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-[300px] md:max-h-[350px] overflow-y-auto overflow-x-auto custom-scrollbar">
                                                            {examCodes
                                                                .filter(ex => selectedRegulation === 'ALL' || ex.title.toUpperCase().includes(selectedRegulation.toUpperCase()))
                                                                .filter(ex => ex.title.toLowerCase().includes(examSearch.toLowerCase()))
                                                                .map((ex: any) => (
                                                                    <div
                                                                        key={ex.code}
                                                                        onClick={() => { setSelectedExam(ex.code); setIsExamDropdownOpen(false); setExamSearch(''); }}
                                                                        className={`group px-3 md:px-4 py-2.5 md:py-3 hover:bg-rose-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 whitespace-nowrap text-left ${selectedExam === ex.code ? 'bg-rose-50/50' : ''}`}
                                                                    >
                                                                        <div className={`text-[11px] md:text-sm tracking-tight ${selectedExam === ex.code ? 'text-rose-600 font-bold' : 'text-slate-600 font-medium'}`}>
                                                                            {ex.title}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            {examCodes.length === 0 && <div className="px-4 py-8 text-center text-slate-400 text-sm">No exams found</div>}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hall Ticket</label>
                                        <input
                                            type="text"
                                            className="block w-full px-4 py-3 md:py-4 text-sm border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all outline-none font-bold text-slate-800 uppercase tracking-wider placeholder-slate-400"
                                            placeholder="HTNO"
                                            value={hallTicket}
                                            onChange={(e) => setHallTicket(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={officialLoading}
                                        className={`h-[48px] md:h-[56px] w-full px-6 rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-rose-600 transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-rose-500/30 ${officialLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {officialLoading ? 'FETCHING...' : 'GET RESULT'}
                                    </button>
                                </form>
                            </div>
                            {officialResult ? renderResultView(officialResult) : !officialLoading && <div className="p-16 bg-white rounded-[2rem] text-center text-slate-500 font-bold border border-slate-100 shadow-sm">Enter details above to fetch result</div>}
                        </div>
                    )}

                    {sidebarActive === 'OverAll Results' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 print:hidden flex flex-col md:flex-row justify-between items-center gap-6">
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 w-full md:w-auto">
                                    <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Layout className="w-5 h-5" /></span>
                                    Overall Result
                                </h2>
                                <form onSubmit={handleSearch} className="w-full md:flex-1 md:max-w-md relative group flex flex-col md:block gap-3">
                                    <input type="text" className="w-full pl-5 md:pr-32 py-3.5 md:py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 font-bold outline-none uppercase text-sm md:text-base focus:border-emerald-400/50 focus:bg-white transition-all" placeholder="HALL TICKET" value={hallTicket} onChange={(e) => setHallTicket(e.target.value.toUpperCase())} />
                                    <button type="submit" className="md:absolute md:right-2 md:top-2 md:bottom-2 px-6 py-3 md:py-0 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-slate-800 transition-colors">SEARCH</button>
                                </form>
                            </div>
                            {result ? renderOverallView(result) : <div className="p-16 bg-white rounded-[2rem] text-center text-slate-500 font-bold border border-slate-100 shadow-sm">Search to view academic history</div>}
                        </div>
                    )}

                    {sidebarActive === 'Pass or Fail Status' && (
                        <div className="animate-fade-in">
                            {renderPassFailStatusView()}
                        </div>
                    )}

                    {sidebarActive === 'Manage Backlogs' && (
                        <div className="animate-fade-in">
                            {renderBacklogView()}
                        </div>
                    )}

                    {sidebarActive === 'Results Contrast' && (
                        <div className="animate-fade-in">
                            {renderContrastView()}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
