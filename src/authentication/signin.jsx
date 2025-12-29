import React from 'react';
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="grid w-screen min-h-screen lg:grid-cols-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Side - Sign In Form */}
      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        {/* Decorative gradient blur */}
        <div className="absolute left-0 rounded-full top-1/4 w-96 h-96 bg-gradient-to-r from-blue-900/20 via-blue-600/20 to-teal-500/20 blur-3xl -z-10"></div>

        {/* Logo */}
        <div className="flex justify-center gap-3 md:justify-start">
          <a href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Complyo Logo" className="object-contain w-12 h-12 transition-all group-hover:scale-105" />
            <span className="text-2xl font-bold text-white">
              Complyo
            </span>
          </a>
        </div>

        {/* Sign In Form Container */}
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-md">
            <SignIn />
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4">
          <div className="text-sm text-center text-slate-400">
            <p>
              Don't have an account?{' '}
              <a href="/sign-up" className="font-medium text-blue-400 transition-colors hover:text-blue-300">
                Start free trial
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <a href="/policies/privacy-policy" className="transition-colors hover:text-blue-400">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/policies/terms-of-service" className="transition-colors hover:text-blue-400">
              Terms of Service
            </a>

            <span>•</span>
            <a href="/" className="transition-colors hover:text-blue-400">
              Back to Home
            </a>
          </div>
          <p className="text-xs text-center text-slate-500">© Kilimanjaro Innovation Labs Inc. | All Rights Reserved </p>
        </div>
      </div>

      {/* Right Side - Branding/Image */}
      <div className="relative hidden border-l lg:block bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-800">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-blue-600/10 to-teal-500/10"></div>
        <div className="absolute right-0 rounded-full top-1/3 w-96 h-96 bg-teal-500/20 blur-3xl"></div>
        <div className="absolute left-0 rounded-full bottom-1/4 w-96 h-96 bg-blue-600/20 blur-3xl"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg space-y-6 text-center">
            <div className="inline-block px-4 py-2 mb-4 text-sm text-blue-400 border rounded-full bg-blue-500/10 border-blue-500/20">
              Automate. Track. Comply.
            </div>
            <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Automated Compliance,
              <span className="block mt-2 text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                Simplified
              </span>
            </h2>
            <p className="text-xl text-slate-300">
              Keep your entire team compliant with intelligent document tracking and automated reminders.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                  99%
                </div>
                <div className="text-sm text-slate-400">Compliance</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                  15+
                </div>
                <div className="text-sm text-slate-400">Hours Saved</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text">
                  24/7
                </div>
                <div className="text-sm text-slate-400">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}