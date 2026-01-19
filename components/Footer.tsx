
import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass border-t border-rose-100 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">JNTUH FastTrack</span>
            <p className="mt-4 text-slate-500 text-sm leading-relaxed font-medium">
              Making academic results accessible, fast, and insightful for every student with advanced data analytics.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Results</a></li>
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Timetables</a></li>
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Syllabus</a></li>
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Previous Papers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Help Center</a></li>
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Contact Us</a></li>
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-base text-slate-500 hover:text-rose-600 transition-colors font-medium">Terms of Service</a></li>
            </ul>
          </div>
          <div>
             <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">Connect</h3>
             <div className="flex space-x-4">
                <a href="#" className="bg-white p-2.5 rounded-full shadow-sm text-slate-400 hover:text-rose-600 hover:shadow-md transition-all border border-rose-50"><Github className="h-5 w-5"/></a>
                <a href="#" className="bg-white p-2.5 rounded-full shadow-sm text-slate-400 hover:text-blue-400 hover:shadow-md transition-all border border-rose-50"><Twitter className="h-5 w-5"/></a>
                <a href="#" className="bg-white p-2.5 rounded-full shadow-sm text-slate-400 hover:text-blue-700 hover:shadow-md transition-all border border-rose-50"><Linkedin className="h-5 w-5"/></a>
             </div>
          </div>
        </div>
        <div className="mt-12 border-t border-rose-100 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-sm text-slate-400 font-medium">&copy; 2024 JNTUH FastTrack. All rights reserved.</p>
          <p className="text-sm text-slate-400 mt-2 md:mt-0 font-medium">Built with ❤️ for students.</p>
        </div>
      </div>
    </footer>
  );
};
