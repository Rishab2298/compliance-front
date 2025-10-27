import React from 'react';
import { Shield } from 'lucide-react';
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen w-screen lg:grid-cols-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Side - Sign In Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 relative">
        {/* Decorative gradient blur */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        
        {/* Logo */}
        <div className="flex justify-center gap-3 md:justify-start">
          <a href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Compliance Manager
            </span>
          </a>
        </div>

        {/* Sign In Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignIn />
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm text-slate-400">
          <p>
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Start free trial
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Branding/Image */}
      <div className="relative hidden lg:block bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l border-slate-800">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-500/10"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg space-y-6 text-center">
            <div className="inline-block bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm border border-blue-500/20 mb-4">
              Trusted by Leading DSPs
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Automated Compliance,
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mt-2">
                Simplified
              </span>
            </h2>
            <p className="text-xl text-slate-300">
              Keep your entire fleet compliant with intelligent document tracking and automated reminders.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-1">
                  99%
                </div>
                <div className="text-sm text-slate-400">Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-1">
                  15+
                </div>
                <div className="text-sm text-slate-400">Hours Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-1">
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