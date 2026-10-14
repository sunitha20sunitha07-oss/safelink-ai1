import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>SafeLink AI</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-semibold">AI-Based Malicious URL Detection</span>
        </div>

        <div className="text-[11px] text-slate-400">
          College Hackathon Project • Cybersecurity Innovation Lab
        </div>
      </div>
    </footer>
  );
};
