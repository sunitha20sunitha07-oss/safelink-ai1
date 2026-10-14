import React, { useState, useEffect } from 'react';
import { Search, X, CornerDownLeft, Sparkles } from 'lucide-react';

interface UrlInputSectionProps {
  onCheckUrl: (url: string) => void;
  onClear: () => void;
  currentUrl?: string;
}

const SAMPLE_URLS = [
  {
    label: 'Banking Phishing Sample',
    url: 'https://secure-login-account-verify-service.bank-update.xyz/auth/login',
  },
  {
    label: 'Punycode Impersonation',
    url: 'https://www.xn--pypal-4ve.com/signin/webapps/mpp/home',
  },
  {
    label: 'Legitimate Portal',
    url: 'https://www.annauniv.edu/academics/curriculum.html',
  },
  {
    label: 'Direct IP Host',
    url: 'http://192.168.1.1/wallet/verify-account',
  },
  {
    label: 'Obfuscated @ URL',
    url: 'https://mybank.com@account-update-portal.xyz/login',
  },
];

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  onCheckUrl,
  onClear,
  currentUrl = '',
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [inputError, setInputError] = useState<string | null>(null);

  // Sync internal state when currentUrl changes from reset or external trigger
  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setInputError('Please enter or paste a website URL to begin inspection.');
      return;
    }

    // Explicit check for whitespace
    if (/\s/.test(trimmed)) {
      setInputError('Invalid URL: The address contains spaces, which is not permitted in valid web links.');
      return;
    }

    setInputError(null);
    onCheckUrl(trimmed);
  };

  const handleClear = () => {
    setInputValue('');
    setInputError(null);
    onClear();
  };

  const handleSelectSample = (sampleUrl: string) => {
    setInputValue(sampleUrl);
    setInputError(null);
    onCheckUrl(sampleUrl);
  };

  return (
    <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Main Heading and Description */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
            URL Threat Intelligence Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Check Before You Click
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Analyse suspicious URLs, understand potential risks, and learn how to stay safe online.
          </p>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-slate-50 border border-slate-300 rounded-lg shadow-xs focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition-all">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 pointer-events-none shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="Paste a website URL here"
                className="w-full py-2.5 pr-8 text-sm sm:text-base text-slate-900 bg-transparent placeholder-slate-400 focus:outline-hidden font-mono"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded mr-1 cursor-pointer"
                  title="Clear URL"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm sm:text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <span>Check URL</span>
              <CornerDownLeft className="w-4 h-4 text-teal-100 hidden sm:inline" />
            </button>
          </div>

          {/* Validation error message */}
          {inputError && (
            <p className="mt-2 text-xs font-medium text-rose-600 text-left pl-1">
              {inputError}
            </p>
          )}
        </form>

        {/* Demo Quick Presets for Hackathon Jury */}
        <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Demo Test Cases:
          </span>
          {SAMPLE_URLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.url)}
              className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
