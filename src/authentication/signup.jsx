import React from 'react';
import { Shield } from 'lucide-react';
import { SignIn, SignInButton, SignUp, SignUpButton } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="grid w-screen min-h-screen lg:grid-cols-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Side - Sign In Form */}
      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        {/* Decorative gradient blur */}
        <div className="absolute left-0 rounded-full top-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 blur-3xl -z-10"></div>

        {/* Logo */}
        <div className="flex justify-center gap-3 md:justify-start">
          <a href="/" className="flex items-center gap-3 group">
            <div className="p-2 transition-all rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
              Compliance Manager
            </span>
          </a>
        </div>

        {/* Sign In Form Container */}
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-md">
            <SignUp 
            forceRedirectUrl="/onboarding-dark"
            fallbackRedirectUrl="/onboarding-dark"/>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-sm text-center text-slate-400">
          <p>
           Already have an account?{' '}
           <SignInButton>
            <button className="font-medium text-violet-400 transition-colors border-0 hover:text-violet-300 bg-none">
              Sign In
            </button>
            </SignInButton>
          </p>
        </div>
      </div>

      {/* Right Side - Branding/Image */}
      <div className="relative hidden border-l lg:block bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-800">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-violet-600/10 to-purple-600/10"></div>
        <div className="absolute right-0 rounded-full top-1/3 w-96 h-96 bg-purple-500/20 blur-3xl"></div>
        <div className="absolute left-0 rounded-full bottom-1/4 w-96 h-96 bg-blue-600/20 blur-3xl"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg space-y-6 text-center">
            <div className="inline-block px-4 py-2 mb-4 text-sm text-violet-400 border rounded-full bg-violet-500/10 border-violet-500/20">
              Trusted by Leading DSPs
            </div>
            <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Automated Compliance,
              <span className="block mt-2 text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
                Simplified
              </span>
            </h2>
            <p className="text-xl text-slate-300">
              Keep your entire fleet compliant with intelligent document tracking and automated reminders.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
                  99%
                </div>
                <div className="text-sm text-slate-400">Compliance</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
                  15+
                </div>
                <div className="text-sm text-slate-400">Hours Saved</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
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