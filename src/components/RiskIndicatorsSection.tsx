import React from 'react';
import {
  Activity,
  Layers,
  Globe,
  Hash,
  AlertTriangle,
  Lock,
  Unlock,
  KeyRound,
  FileCode,
  CheckCircle,
  HelpCircle,
  Binary,
} from 'lucide-react';
import { UrlFeatures } from '../types';
import { calculateShannonEntropy } from '../ml/featureExtractor';

interface RiskIndicatorsSectionProps {
  features?: UrlFeatures | null;
}

export const RiskIndicatorsSection: React.FC<RiskIndicatorsSectionProps> = ({
  features,
}) => {
  // If no URL features have been extracted yet, show the pre-extraction layout
  if (!features) {
    const indicators = [
      {
        name: 'Full Hostname & Domain Hierarchy',
        desc: 'Extracts top-level domain (TLD), root domain, and subdomain depth.',
        metricType: 'Domain Decomposition',
      },
      {
        name: 'URL Length & Punctuation Counts',
        desc: 'Measures total character count and frequency of dots and hyphens.',
        metricType: 'Lexical Metrics',
      },
      {
        name: 'IP Address as Hostname & @ Symbol',
        desc: 'Detects raw IP hosts bypassing DNS and credential obfuscation via @.',
        metricType: 'Host Obfuscation',
      },
      {
        name: 'Suspicious Keywords & Punycode (xn--)',
        desc: 'Checks for security lures (login, verify, update) and homoglyph encodings.',
        metricType: 'Lure & IDN Scanner',
      },
      {
        name: 'Transport Layer Protocol (HTTPS)',
        desc: 'Verifies whether transport-level encryption is declared in the scheme.',
        metricType: 'Scheme Inspector',
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
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Risk Indicators
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Structural & lexical feature extraction
              </p>
            </div>

            <span className="text-[11px] font-semibold tracking-wide text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded shrink-0">
              Awaiting URL
            </span>
          </div>

          {/* Feature Overview List */}
          <div className="space-y-2.5 my-4">
            {indicators.map((ind, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-md text-left"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800">
                    {ind.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {ind.metricType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration note */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Extraction Pipeline
          </span>
          <span className="text-teal-700 font-mono text-[10px] font-medium">Ready for Input</span>
        </div>
      </div>
    );
  }

  // Active extracted features view
  const {
    hostname,
    domainStructure,
    urlLength,
    dotsInHostname,
    dotsInUrl,
    hyphensInHostname,
    hyphensInUrl,
    isIpHostname,
    ipType,
    hasAtSymbol,
    matchedKeywords,
    hasPunycode,
    punycodeLabels,
    isHttps,
    protocol,
  } = features;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Risk Indicators
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Extracted visible URL structure & lexical patterns
            </p>
          </div>

          <span className="text-[11px] font-semibold tracking-wide text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded shrink-0">
            Features Extracted
          </span>
        </div>

        {/* Extracted Items Grid */}
        <div className="space-y-3 my-4">
          {/* 1. Hostname & Domain Breakdown */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                Full Hostname & Hierarchy
              </span>
              <span className="text-[10px] font-mono text-slate-400">DNS Node</span>
            </div>
            <div className="font-mono text-xs text-slate-800 break-all bg-white p-2 rounded border border-slate-200/80 mb-2">
              {hostname}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-600">
              <div className="bg-white p-1.5 rounded border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">Subdomain</span>
                <span className="font-mono text-slate-800 truncate block">
                  {domainStructure.subdomain}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">Root Domain</span>
                <span className="font-mono text-slate-800 truncate block font-medium">
                  {domainStructure.rootDomain}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">Extension (TLD)</span>
                <span className="font-mono text-slate-800 block">
                  {domainStructure.tld}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              <span className="font-medium text-slate-700">Observation:</span> Multi-tiered subdomains are frequently combined with unrelated root domains to mimic reputable services.
            </p>
          </div>

          {/* 2. URL Length & Character Counts */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-teal-600" />
                URL Length & Punctuation Counts
              </span>
              <span className="text-[10px] font-mono text-slate-400">Structural Complexity</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-2">
              <div className="bg-white p-2 rounded border border-slate-200/80 text-center">
                <span className="text-slate-400 text-[10px] block">URL Length</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {urlLength}
                </span>
                <span className="text-[10px] text-slate-500 block">chars</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200/80 text-center">
                <span className="text-slate-400 text-[10px] block">Dots Count</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {dotsInHostname}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  host ({dotsInUrl} url)
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200/80 text-center">
                <span className="text-slate-400 text-[10px] block">Hyphens</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {hyphensInHostname}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  host ({hyphensInUrl} url)
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200/80 text-center">
                <span className="text-slate-400 text-[10px] block">Shannon Entropy</span>
                <span className="text-sm font-bold text-teal-700 font-mono">
                  {calculateShannonEntropy(hostname)}
                </span>
                <span className="text-[10px] text-slate-500 block">bits/char</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-700">Observation:</span> Elevated character length (&gt;75 chars) or excessive hyphens in the hostname often reflect brand concatenation tricks.
            </p>
          </div>

          {/* 3. IP Address Host & @ Symbol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">
                IP Address Hostname
              </span>
              <div className="flex items-center gap-1.5 mb-1">
                {isIpHostname ? (
                  <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                    <Binary className="w-3.5 h-3.5 text-rose-600" />
                    Detected ({ipType})
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                    No (Named FQDN)
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {isIpHostname
                  ? 'Host uses a direct numeric IP address, bypassing standard DNS name registration.'
                  : 'Host resolves via standard domain name resolution.'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">
                @ Symbol in URL
              </span>
              <div className="flex items-center gap-1.5 mb-1">
                {hasAtSymbol ? (
                  <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Present in URL
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                    Not Detected
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {hasAtSymbol
                  ? '@ is used for URL userinfo, which can mislead users regarding the actual destination host.'
                  : 'Standard authority delimiter without embedded user credentials.'}
              </p>
            </div>
          </div>

          {/* 4. Suspicious Keywords & Punycode (xn--) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Keywords */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                  Targeted Keywords
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {matchedKeywords.length} found
                </span>
              </div>
              <div className="min-h-6 flex flex-wrap gap-1 mb-1">
                {matchedKeywords.length > 0 ? (
                  matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[10px] rounded"
                    >
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-600 font-medium">
                    None observed in path/host
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Scans for terms like login, verify, update, wallet, or secure.
              </p>
            </div>

            {/* Punycode */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                  Punycode (xn--)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {hasPunycode ? 'Present' : 'None'}
                </span>
              </div>
              <div className="min-h-6 mb-1">
                {hasPunycode ? (
                  <div className="text-xs font-mono text-rose-700 font-medium break-all">
                    {punycodeLabels.join(', ')}
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 font-medium">
                    No IDN punycode labels
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Punycode labels can indicate look-alike Cyrillic or Unicode homoglyph characters.
              </p>
            </div>
          </div>

          {/* 5. HTTPS Transport Usage */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                {isHttps ? (
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                )}
                Transport Protocol Scheme
              </span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {protocol}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-700">Observation:</span>{' '}
              {isHttps
                ? 'HTTPS is active. Transport layer encryption secures communication in transit, though it does not verify whether the website operator is benign or malicious.'
                : 'Insecure plaintext HTTP scheme. Data transmitted across this connection is unencrypted.'}
            </p>
          </div>
        </div>

        {/* Factual Observation Disclaimer (Requirement 4, 5, 6) */}
        <div className="bg-slate-100/90 border border-slate-200 rounded-md p-3 text-[11px] text-slate-600 leading-relaxed mb-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Analytical Boundary Notice</span>
          </div>
          These structural indicators are visible lexical observations of the URL string. They do not constitute machine learning classification, nor do they claim to verify SSL validity, DNS records, or domain registration age, which require external network intelligence services.
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-2">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          Lexical Engine
        </span>
        <span className="text-teal-700 font-mono text-[10px] font-medium">9 Features Extracted</span>
      </div>
    </div>
  );
};
