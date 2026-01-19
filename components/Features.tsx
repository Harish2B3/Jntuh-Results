
import React from 'react';
import { Zap, ShieldCheck, PieChart, Clock, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    bg: "bg-amber-100",
    title: "Lightning Fast Results",
    description: "Hosted on high-performance edge servers to ensure you see your grades the second they drop."
  },

  {
    icon: <PieChart className="w-6 h-6 text-emerald-500" />,
    bg: "bg-emerald-100",
    title: "GPA & CGPA Trends",
    description: "Visual graphs to track your academic journey across all semesters. Identify your strengths easily."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
    bg: "bg-blue-100",
    title: "Official Data Source",
    description: "Directly synced with university servers to ensure 100% accuracy and reliability of data."
  },
  {
    icon: <Clock className="w-6 h-6 text-rose-500" />,
    bg: "bg-rose-100",
    title: "Real-time Notifications",
    description: "Never miss an update. Subscribe to get SMS/Email alerts for results, timetables, and fee dues."
  },
  {
    icon: <Smartphone className="w-6 h-6 text-purple-500" />,
    bg: "bg-purple-100",
    title: "Mobile First Design",
    description: "Optimized for every screen. Check your results on the go with our responsive interface."
  }
];

export const Features: React.FC = () => {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 font-bold text-sm tracking-wide uppercase mb-3 shadow-sm">Why Choose Us</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800">
            More than just a <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">results page</span>
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto font-medium">
            We provide a comprehensive suite of tools to help JNTUH students succeed, wrapped in a beautiful experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="glass-card hover:-translate-y-2 transition-transform duration-300 p-8 h-full flex flex-col items-start border border-white/50">
              <div className={`inline-flex items-center justify-center p-4 rounded-2xl ${feature.bg} mb-6 shadow-inner`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
