import React, { useState, useEffect } from "react";

const PublicFooter = () => {
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
    <footer className={`px-6 py-12 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 mb-8 md:grid-cols-4">
          <div>
            <div className="flex items-center mb-4 space-x-3">
              <img src="/logo.png" alt="Complyo Logo" className="object-contain w-10 h-10" />
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Complyo</span>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Streamline employee documents compliance with AI-powered tracking, automated reminders, and real-time visibility.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>
                <a href="/#features" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#security" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Security
                </a>
              </li>
              <li>
                <a href="#roadmap" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          <div>
  <h4 className="mb-4 font-semibold">Industries</h4>
  <ul
    className={`space-y-2 text-sm ${
      theme === "dark" ? "text-slate-400" : "text-slate-600"
    }`}
  >
    <li>
      <a
        href="/healthcare"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Healthcare
      </a>
    </li>

    <li>
      <a
        href="/shipping-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Shipping & Logistics
      </a>
    </li>

    <li>
      <a
        href="/real-estate-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Real Estate
      </a>
    </li>

    <li>
      <a
        href="/manufacturing-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Manufacturing
      </a>
    </li>

    <li>
      <a
        href="/education-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Education
      </a>
    </li>

    <li>
      <a
        href="/insurance-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Insurance
      </a>
    </li>

    <li>
      <a
        href="/security-guard-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Security Services
      </a>
    </li>

    <li>
      <a
        href="/service-provider-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Service Providers
      </a>
    </li>

    <li>
      <a
        href="/government-management"
        className={theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600"}
      >
        Government & Public Sector
      </a>
    </li>
  </ul>
</div>


          <div>
            <h4 className="mb-4 font-semibold">Policies</h4>
            <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>
                <a href="/policies/terms-of-service" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/policies/privacy-policy" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/policies/data-processing-agreement" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Data Processing Addendum
                </a>
              </li>
              <li>
                <a href="/policies/ai-fair-use-policy" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  AI Fair Use Policy
                </a>
              </li>
              <li>
                <a href="/policies/gdpr-data-processing-addendum" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  GDPR Data Processing
                </a>
              </li>
              <li>
                <a href="/policies/complaints-policy" className={theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}>
                  Complaints Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={`pt-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
          {/* Footer Links */}
          <div className={`flex flex-wrap items-center justify-center gap-4 mb-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            <a href="/policies/terms-of-service" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Terms of Service
            </a>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <a href="/policies/privacy-policy" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Privacy Policy
            </a>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <a href="/policies/data-processing-agreement" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Data Processing
            </a>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <a href="/policies/ai-fair-use-policy" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              AI Fair Use
            </a>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <a href="/policies/gdpr-data-processing-addendum" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              GDPR
            </a>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <a href="/policies/complaints-policy" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Complaints Policy
            </a>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <a href="/complaints" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Register A Complaint
            </a>
            <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <a href="/contact" className={`transition-colors ${theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className={`text-sm text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>

            A Product of Kilimanjaro Innovation Labs Inc. © 2026 Complyo | All Rights Reserved 

          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
