import React, { useState, useEffect } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

const PublicLayout = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };

    // Listen for theme changes
    window.addEventListener('storage', handleStorageChange);

    // Poll for theme changes in the same tab
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  return (
    <div className={`w-screen min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'text-slate-900 bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      <PublicHeader />
      <main>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
