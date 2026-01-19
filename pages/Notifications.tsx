import React, { useEffect, useState } from 'react';
import { Bell, Info, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { fetchRCRVNotifications } from '../services/api';

interface NotificationData {
    date: string | null;
    title: string;
    deadline: string | null;
    isNew: boolean;
}

export const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const loadNotifications = async () => {
            setLoading(true);
            const res = await fetchRCRVNotifications();
            if (res.success && res.data) {
                setNotifications(res.data);
            } else {
                setError(res.error || 'Failed to load notifications');
            }
            setLoading(false);
        };

        loadNotifications();
    }, []);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = notifications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(notifications.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
                            <p className="text-slate-500 font-medium">Stay updated with latest JNTUH RC/RV announcements</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-rose-500" />
                        <p className="font-bold text-sm uppercase tracking-widest">Fetching Notifications...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-center">
                        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <p className="text-rose-600 font-bold">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {currentItems.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 font-medium">
                                    No notifications found at the moment.
                                </div>
                            ) : (
                                currentItems.map((notif, idx) => (
                                    <div key={idx} className={`group bg-white p-6 rounded-3xl border ${notif.isNew ? 'border-rose-100 shadow-lg shadow-rose-500/5' : 'border-slate-100 shadow-sm'} hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                                        {notif.isNew && (
                                            <div className="absolute top-0 right-0 p-2">
                                                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.isNew ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {notif.isNew ? <Award className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-4">
                                                    <h3 className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors uppercase tracking-tight text-sm">
                                                        {notif.title}
                                                    </h3>
                                                    {notif.date && (
                                                        <div className="flex items-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {notif.date}
                                                        </div>
                                                    )}
                                                </div>
                                                {notif.deadline && (
                                                    <p className="text-rose-500 text-xs font-bold mt-1 mb-2 bg-rose-50 inline-block px-2 py-1 rounded-lg">
                                                        {notif.deadline}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                >
                                    Prev
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum = currentPage;
                                        if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;

                                        if (pageNum < 1 || pageNum > totalPages) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-300 ${currentPage === pageNum
                                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                                                        : 'bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-12 text-center text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                    End of Updates
                </div>
            </div>
        </div>
    );
};

// Internal Import for icons reused
const Award = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></svg>
);
