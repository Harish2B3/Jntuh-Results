import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, BarChart2, Home, Bell } from 'lucide-react';

export const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4 mr-2" /> },
    { name: 'Check Results', path: '/results', icon: <BarChart2 className="w-4 h-4 mr-2" /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell className="w-4 h-4 mr-2" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 glass shadow-sm border-b border-rose-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-tr from-rose-500 to-pink-500 p-2.5 rounded-xl text-white shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                JNTUH<span className="font-light text-slate-400">FastTrack</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-end">

            <div className="flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-bold flex items-center transition-all duration-200 ${isActive(link.path)
                    ? 'bg-rose-100 text-rose-700 shadow-sm'
                    : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-rose-100">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${isActive(link.path)
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                  }`}
              >
                <div className="flex items-center">
                  {link.icon} {link.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};