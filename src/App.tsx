/**
 * SafeLink AI - AI-Based Malicious URL Detection
 * College Hackathon Prototype Dashboard
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UrlInputSection } from './components/UrlInputSection';
import { ResultsSection } from './components/ResultsSection';
import { RiskIndicatorsSection } from './components/RiskIndicatorsSection';
import { TrustGapSection } from './components/TrustGapSection';
import { SafetyActionsSection } from './components/SafetyActionsSection';
import { TamilVoiceSection } from './components/TamilVoiceSection';
import { Footer } from './components/Footer';
import { ProjectScopeModal } from './components/ProjectScopeModal';
import { UrlSubmission } from './types';
import { extractUrlFeatures } from './utils/urlExtractor';
import { predictUrl } from './ml/predictor';

export default function App() {
  const [currentSubmission, setCurrentSubmission] = useState<UrlSubmission | null>(null);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);

  const handleCheckUrl = (rawInput: string) => {
    const result = extractUrlFeatures(rawInput);

    if (result.error) {
      setCurrentSubmission({
        rawUrl: rawInput,
        submittedAt: new Date(),
        error: result.error,
      });
      return;
    }

    // Run real ML model inference
    const mlResult = predictUrl(rawInput);

    if (result.features) {
      setCurrentSubmission({
        rawUrl: rawInput,
        submittedAt: new Date(),
        protocol: result.features.protocol,
        hostname: result.features.hostname,
        pathname: result.features.pathname,
        features: result.features,
        prediction: mlResult.prediction,
      });
    }
  };

  const handleClear = () => {
    setCurrentSubmission(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      {/* Navigation Header */}
      <Navbar
        onReset={handleClear}
        onOpenInfo={() => setIsScopeModalOpen(true)}
      />

      <main className="flex-1">
        {/* Main URL Input Stage (Check Before You Click) */}
        <UrlInputSection
          onCheckUrl={handleCheckUrl}
          onClear={handleClear}
          currentUrl={currentSubmission?.rawUrl}
        />

        {/* Dashboard Core Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Section 6: Results Area (Empty, Error, or Real ML Predicted State) */}
          <ResultsSection
            submission={currentSubmission}
            onClear={handleClear}
          />

          {/* Threat Inspection & Defense Modules Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Threat Inspection & Defense Modules
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                13-feature lexical extraction, real ensemble ML inference, trust gap analysis, and accessibility.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              {currentSubmission?.prediction
                ? `${currentSubmission.prediction.verdict} (${currentSubmission.prediction.confidencePercent}% Consensus)`
                : 'Real ML Model Loaded (90.80% Test Accuracy)'}
            </div>
          </div>

          {/* Section 7: Grid of Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Risk Indicators (Real feature extraction active) */}
            <RiskIndicatorsSection features={currentSubmission?.features} />

            {/* 2. Trust Gap Analysis (Intact reserved module) */}
            <TrustGapSection />

            {/* 3. Recommended Safety Actions (Intact reserved module) */}
            <SafetyActionsSection />

            {/* 4. Tamil Voice Assistance (Intact reserved module with interactive speech preview) */}
            <TamilVoiceSection />
          </div>
        </div>
      </main>

      {/* Section 8: Small Footer */}
      <Footer />

      {/* Hackathon Scope & Architecture Dialog */}
      <ProjectScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
      />
    </div>
  );
}
