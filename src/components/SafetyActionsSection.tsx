import React from 'react';
import { ShieldAlert, CheckSquare, Lock, PhoneCall, ShieldCheck } from 'lucide-react';

export const SafetyActionsSection: React.FC = () => {
  const safetyProtocols = [
    {
      action: 'Credential Containment',
      detail: 'Strictly avoid submitting passwords, debit/credit cards, or OTPs on unverified forms.',
      status: 'Advisory Guardrail',
    },
    {
      action: 'Official Channel Cross-Verification',
      detail: 'Cross-check through verified telephone directory or official government / bank portal.',
      status: 'Verification Step',
    },
    {
      action: 'Network Sandbox Isolation',
      detail: 'Open suspicious links only in isolated virtual sandboxes or disposable containers.',
      status: 'Defensive Practice',
    },
    {
      action: 'Cyber Incident Telemetry Reporting',
      detail: 'Transmit verified phishing URLs to national cyber crime portals (e.g., cybercrime.gov.in).',
      status: 'Community Defense',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Recommended Safety Actions
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Actionable cybersecurity response steps for safe browsing
            </p>
          </div>

          <span className="text-[11px] font-semibold tracking-wide text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded shrink-0">
            Reserved
          </span>
        </div>

        {/* Safety recommendations */}
        <div className="space-y-2.5 my-4">
          {safetyProtocols.map((p, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-md text-left"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-800">
                  {p.action}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {p.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {p.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Integration placeholder note */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          Dynamic safety rulebook
        </span>
        <span className="text-slate-500 font-mono">Module Ready</span>
      </div>
    </div>
  );
};
