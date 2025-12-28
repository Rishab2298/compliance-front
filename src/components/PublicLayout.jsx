import React, { useState, useEffect } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

const PublicLayout = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const handleThemeChange = (event) => {
      setTheme(event.detail);
    };

    // Listen for custom theme change events
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

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
