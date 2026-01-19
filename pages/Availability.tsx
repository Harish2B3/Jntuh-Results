import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBatchStatus } from '../backend/api';
import { ChevronLeft, ChevronRight, Search, Users, Activity, Filter, Eye } from 'lucide-react';

interface BatchItem {
  id: string;
  status: string;
  name?: string;
}

export const Availability: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPending, setShowPending] = useState(false); // Default: Hide pending
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const ITEMS_PER_PAGE = 30;

  const loadData = async () => {
    const data = await getBatchStatus();
    if (data.items) {
        // Sort: Completed first, then by ID
        const sorted = data.items.sort((a, b) => {
            if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
            if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1;
            return a.id.localeCompare(b.id);
        });
        setItems(sorted);
    }
    setLoading(false);
  };

  // Poll for updates (Sync with background tasks from other tabs/pages)
  useEffect(() => {
    loadData();
    const poll = setInterval(loadData, 5000); 
    return () => clearInterval(poll);
  }, []);

  // Filtering Logic
  // 1. Search Query
  // 2. Status Filter (Show only COMPLETED unless toggle is on)
  const filteredItems = items.filter(i => {
      const matchesSearch = i.id.includes(searchQuery.toUpperCase()) || i.name?.includes(searchQuery.toUpperCase());
      const matchesStatus = showPending ? true : i.status === 'COMPLETED';
      return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
                    Available Results
                    <span className="ml-3 flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                  Browse results that have been successfully fetched and cached.
                </p>
            </div>
            
            <button 
                onClick={() => setShowPending(!showPending)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showPending ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}
            >
                {showPending ? <Eye className="w-4 h-4 mr-1"/> : <Filter className="w-4 h-4 mr-1"/>}
                {showPending ? 'Hide Queue' : 'Show Processing Queue'}
            </button>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-rose-300" /></div>
            <input type="text" className="block w-full pl-11 pr-4 py-4 border-0 rounded-2xl bg-white shadow-lg shadow-rose-100 text-slate-900 placeholder-rose-200 focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all text-base font-medium uppercase" placeholder="Search Roll Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Grid */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
              <Activity className="w-10 h-10 text-rose-500 animate-spin mb-4"/>
              <div className="text-rose-500 font-bold">Syncing Database...</div>
           </div>
        ) : filteredItems.length === 0 ? (
           <div className="text-center py-20 bg-white/50 rounded-2xl border border-rose-50">
              <Users className="w-12 h-12 text-rose-200 mx-auto mb-4"/>
              <h3 className="text-lg font-bold text-slate-700">No results found</h3>
              <p className="text-slate-500 mt-2">
                  {showPending ? "Queue is empty." : "Try enabling 'Show Processing Queue' or search for a student ID to fetch new data."}
              </p>
           </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 min-h-[400px]">
                {paginatedItems.map((item) => (
                    <Link 
                        key={item.id} 
                        to={item.status === 'COMPLETED' ? `/results/${item.id}` : '#'} 
                        className={`relative overflow-hidden rounded-2xl py-6 px-4 flex flex-col items-center justify-center text-center shadow-md transition-all duration-300 border group ${
                        item.status === 'COMPLETED' ? 'bg-white border-slate-100 hover:-translate-y-1 hover:shadow-xl cursor-pointer' : 
                        item.status === 'FAILED' ? 'bg-rose-50 border-rose-200 opacity-80' : 
                        'bg-slate-50 border-slate-200 opacity-60 cursor-default'
                    }`}>
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${
                            item.status === 'COMPLETED' ? 'bg-emerald-500' : 
                            item.status === 'FAILED' ? 'bg-rose-600' : 
                            'bg-slate-300'
                        }`}></div>
                        
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Roll No</span>
                        <span className="text-xl font-black tracking-tight text-slate-800">{item.id}</span>
                        
                        {item.status === 'COMPLETED' && (
                            <span className="text-xs font-bold mt-2 truncate max-w-full px-2 text-emerald-600">
                                {item.name}
                            </span>
                        )}
                        
                        <div className={`mt-3 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                            item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                            item.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 
                            'bg-slate-200 text-slate-500'
                        }`}>
                            {item.status === 'PENDING' && "IN QUEUE"}
                            {item.status === 'COMPLETED' && "AVAILABLE"}
                            {item.status === 'FAILED' && "NOT FOUND"}
                        </div>
                    </Link>
                ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-6">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 rounded-full bg-white shadow-md border border-slate-100 disabled:opacity-50 hover:bg-slate-50 transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                  <span className="text-sm font-extrabold text-slate-800">Page <span className="text-rose-600">{page}</span> of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-3 rounded-full bg-white shadow-md border border-slate-100 disabled:opacity-50 hover:bg-slate-50 transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};