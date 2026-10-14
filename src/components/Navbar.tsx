import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface NavbarProps {
  onReset?: () => void;
  onOpenInfo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset, onOpenInfo }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 text-left group transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-lg shadow-xs">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                SafeLink AI
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                Prototype v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              AI-Based Malicious URL Detection
            </p>
          </div>
        </button>

        {/* Right side action / Hackathon tag */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-xs font-medium text-slate-600 block">
              College Hackathon Project
            </span>
            <span className="text-[11px] text-slate-400">
              Cybersecurity Track
            </span>
          </div>

          {onOpenInfo && (
            <button
              onClick={onOpenInfo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              title="About Project Architecture"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Project Scope</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
