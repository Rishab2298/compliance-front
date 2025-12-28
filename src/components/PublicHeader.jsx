import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import {  useNavigate } from "react-router-dom";

const PublicHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? theme === 'dark'
            ? "bg-slate-900/95 backdrop-blur-lg shadow-lg"
            : "bg-white/95 backdrop-blur-lg shadow-lg"
          : "bg-transparent"
      }`}>
      <div className="px-6 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="object-contain w-14 h-14" />
            </div>
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Complyo
            </span>
          </div>

          <div className="items-center hidden space-x-8 md:flex">
            <a
              href="/#features"
              className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Features
            </a>
            <a
              href="/#how-it-works"
              className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              How It Works
            </a>
            <a
              href="/#pricing"
              className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Pricing
            </a>
            <button
              onClick={toggleTheme}
              className={`p-2 transition-all rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
              aria-label="Toggle theme">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <SignedOut>
              <SignInButton>
                <button className="px-6 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`border-t md:hidden backdrop-blur-lg ${
          theme === 'dark'
            ? 'bg-slate-900/95 border-slate-800'
            : 'bg-white/95 border-slate-200'
        }`}>
          <div className="px-6 py-4 space-y-4">
            <a href="/#features" className={`block ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Features
            </a>
            <a href="/#how-it-works" className={`block ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              How It Works
            </a>
            <a href="/#pricing" className={`block ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Pricing
            </a>
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-between w-full p-3 transition-all rounded-lg ${
                theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200'
              }`}
              aria-label="Toggle theme">
              <span>Theme</span>
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <SignInButton>
              <button className="w-full px-6 py-2 text-white rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600">
                Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicHeader;
