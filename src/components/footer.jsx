import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Footer = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <footer className={`w-full border-t ${
      isDarkMode
        ? 'bg-slate-900/95 border-slate-800'
        : 'bg-slate-100 border-slate-200'
    }`}>
      <div className="container px-6 py-4 mx-auto">
        <div className="flex items-center justify-between">
          <p className={`text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            © 2025 Complyo. All rights reserved.
          </p>

          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-slate-800 text-violet-400 hover:bg-slate-700 border border-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;