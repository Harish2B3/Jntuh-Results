import React from 'react';
import { Bell, Info, AlertCircle, Clock } from 'lucide-react';

export const Notifications: React.FC = () => {
    const notifications = [
        {
            id: 1,
            title: 'Results Declared: B.Tech IV Year II Semester R18',
            description: 'The regular/supplementary results for IV-II (R18) have been released on the official portal.',
            type: 'result',
            time: '2 hours ago',
            isNew: true
        },
        {
            id: 2,
            title: 'Examination Fee Deadline',
            description: 'Last date for payment of exam fee for B.Tech I-I, I-II Supplementary is 25th Jan 2026.',
            type: 'info',
            time: '1 day ago',
            isNew: false
        },
        {
            id: 3,
            title: 'Server Maintenance Scheduled',
            description: 'Result servers will be down for maintenance on Saturday from 2:00 AM to 4:00 AM.',
            type: 'alert',
            time: '3 days ago',
            isNew: false
        }
    ];

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
                            <p className="text-slate-500 font-medium">Stay updated with latest JNTUH announcements</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`group bg-white p-6 rounded-3xl border ${notif.isNew ? 'border-rose-100 shadow-lg shadow-rose-500/5' : 'border-slate-100 shadow-sm'} hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                            {notif.isNew && (
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.type === 'result' ? 'bg-emerald-50 text-emerald-600' :
                                    notif.type === 'alert' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {notif.type === 'result' ? <Award className="w-6 h-6" /> :
                                        notif.type === 'alert' ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-4">
                                        <h3 className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors uppercase tracking-tight text-sm">
                                            {notif.title}
                                        </h3>
                                        <div className="flex items-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {notif.time}
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        {notif.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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
