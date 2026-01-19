import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Features } from '../components/Features';
import { Bell, ArrowRight, Search, TrendingUp, Clock, CheckCircle, Shield, Star, BarChart, Loader2 } from 'lucide-react';
import { fetchRCRVNotifications } from '../services/api';

interface NotificationData {
  date: string | null;
  title: string;
  deadline: string | null;
  isNew: boolean;
}

export const Home: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const res = await fetchRCRVNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.slice(0, 5));
      }
      setLoading(false);
    };
    loadNotifications();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative blobs code remains same... */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-rose-600 mr-2 animate-pulse"></span>
            R22 & R18 Results Live Now
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Your Academic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600">Performance</span> Portal
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed font-medium mx-auto lg:mx-0">
            The fastest way to check JNTUH results and track your GPA progression across semesters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
            <Link to="/results" className="flex items-center justify-center px-8 py-4 rounded-full text-lg font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-1 transition-all duration-300">
              <Search className="w-5 h-5 mr-2" />
              Check Results
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center lg:justify-start space-x-4 text-sm font-semibold text-slate-500">
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> Official Data</div>
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> Instant Updates</div>
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> Privacy Focused</div>
          </div>
        </div>
        <div className="flex-1 relative hidden lg:block">
          <div className="relative w-full max-w-lg mx-auto aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-purple-200 rounded-full opacity-20 animate-pulse blur-3xl"></div>
            <div className="absolute inset-x-4 inset-y-12 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl p-6 flex flex-col justify-between transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold">JD</div>
                  <div>
                    <div className="h-2 w-24 bg-slate-200 rounded mb-1.5"></div>
                    <div className="h-2 w-16 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">PASS</div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/50">
                    <div className="h-2 w-32 bg-slate-200 rounded"></div>
                    <div className="h-2 w-8 bg-slate-300 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">SGPA</div>
                  <div className="text-3xl font-black text-rose-500">9.24</div>
                </div>
                <BarChart className="w-8 h-8 text-rose-300" />
              </div>
            </div>
            <div className="absolute -right-4 top-20 bg-white p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms]">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Star className="w-5 h-5 fill-current" /></div>
                <div>
                  <div className="text-xs font-bold text-slate-400">Class Rank</div>
                  <div className="text-lg font-bold text-slate-800">Top 5%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass border-y border-rose-100 py-3 mb-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center overflow-hidden">
          <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 mr-2 sm:mr-6 border border-rose-200 shadow-sm z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>
            LIVE
          </span>
          <div className="flex relative overflow-hidden w-full pl-2 sm:pl-0">
            <div className="animate-marquee whitespace-nowrap flex space-x-16 items-center">
              <span className="flex items-center text-sm font-semibold text-slate-600"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Latest JNTUH Results Live</span>
              <span className="flex items-center text-sm font-semibold text-slate-600"><TrendingUp className="w-4 h-4 mr-2 text-rose-500" /> New RC/RV Notifications Added</span>
              <span className="flex items-center text-sm font-semibold text-slate-600"><Clock className="w-4 h-4 mr-2 text-amber-500" /> Real-time Portal Sync Enabled</span>
              <span className="flex items-center text-sm font-semibold text-slate-600"><Shield className="w-4 h-4 mr-2 text-blue-500" /> Highly Secure Results Access</span>
            </div>
          </div>
        </div>
      </div>

      <Features />

      {/* Latest Notifications Section */}
      <div className="py-20 bg-white/30 backdrop-blur-sm border-t border-rose-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800">Latest Updates</h2>
            <p className="text-slate-500 mt-2 font-medium">Stay informed with the latest releases from JNTUH</p>
          </div>

          <div className="glass-card overflow-hidden ring-1 ring-white/60 shadow-xl">
            <div className="px-6 py-4 border-b border-rose-100/50 bg-rose-50/30 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Notifications Board</h3>
              </div>
              <Link to="/notifications" className="text-xs font-bold text-rose-600 hover:text-rose-700">View All</Link>
            </div>
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-rose-500" />
                <p className="text-xs font-bold uppercase tracking-widest">Fetching Latest...</p>
              </div>
            ) : (
              <ul className="divide-y divide-rose-50">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-medium">No recent updates available</div>
                ) : (
                  notifications.map((item, i) => (
                    <li key={i}>
                      <Link to="/notifications" className="block hover:bg-white/60 transition duration-200 group">
                        <div className="px-6 py-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors uppercase tracking-tight">
                                {item.title}
                              </p>
                              <div className="flex items-center mt-2 space-x-4">
                                {item.isNew && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-600 border border-rose-200 animate-pulse">
                                    NEW
                                  </span>
                                )}
                                {item.date && (
                                  <span className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-wide">
                                    <Clock className="flex-shrink-0 mr-1.5 h-3 w-3" />
                                    {item.date}
                                  </span>
                                )}
                                {item.deadline && (
                                  <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                    {item.deadline}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-rose-400 transform group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto glass-card p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Ready to check your results?</h2>
            <p className="text-lg text-slate-600 mb-8 font-medium">The fastest and most reliable way to access JNTUH academic records.</p>
            <div className="flex justify-center gap-4">
              <Link to="/results" className="px-8 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:scale-105 transition-all">Check Now</Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
