import React from 'react';
import { GitCompare, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

export const TrustGapSection: React.FC = () => {
  const trustGapVectors = [
    {
      title: 'Brand Impersonation Delta',
      desc: 'Detects logos, trademarks, or organization names registered on unrelated hosting providers.',
      probe: 'Entity Matching',
    },
    {
      title: 'SSL/TLS Certificate Authority',
      desc: 'Compares certificate issuer tiers against standard financial and institutional requirements.',
      probe: 'X.509 Inspector',
    },
    {
      title: 'Domain Age vs. Claimed Authority',
      desc: 'Identifies newly registered domains (e.g. < 30 days) purporting to be established organizations.',
      probe: 'WHOIS Telemetry',
    },
    {
      title: 'Autonomous System (ASN) Profiling',
      desc: 'Flags bulletproof hosting networks and cloud providers with elevated abuse rates.',
      probe: 'BGP Routing Mesh',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <GitCompare className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Trust Gap Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Discrepancy detection between claimed identity and technical reality
            </p>
          </div>

          <span className="text-[11px] font-semibold tracking-wide text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0">
            Reserved
          </span>
        </div>

        {/* Vector breakdown */}
        <div className="space-y-2.5 my-4">
          {trustGapVectors.map((v, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-md text-left"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-800">
                  {v.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {v.probe}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Integration placeholder note */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          Heuristic discrepancy engine
        </span>
        <span className="text-slate-500 font-mono">Module Ready</span>
      </div>
    </div>
  );
};
