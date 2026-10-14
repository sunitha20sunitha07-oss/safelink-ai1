import React from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, Terminal, Cpu, Volume2, Database, BarChart3 } from 'lucide-react';
import evaluationData from '../ml/modelEvaluation.json';

interface ProjectScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectScopeModal: React.FC<ProjectScopeModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              SafeLink AI • Project Architecture & ML Specs
            </h3>
            <p className="text-xs text-slate-500">
              AI-Based Malicious URL Detection • Hackathon Evaluation Dossier
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline roadmap */}
        <div className="space-y-4 text-xs text-slate-600">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              Machine Learning Pipeline Stages
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="font-bold text-teal-700 block mb-1">1. Balanced Data</span>
                <p className="text-[11px] text-slate-500">
                  5,000 balanced instances from UNB ISCX-URL-2016, Tranco Top Sites, & PhishTank Verified Feed.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="font-bold text-teal-700 block mb-1">2. 13-Feature Schema</span>
                <p className="text-[11px] text-slate-500">
                  Shared deterministic vectors: entropy, length, dots, hyphens, IP host, @ symbol, punycode, HTTPS, and keywords.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="font-bold text-teal-700 block mb-1">3. Bagging Ensemble</span>
                <p className="text-[11px] text-slate-500">
                  Ensemble of 7 regularized CART Decision Trees evaluated on 1,000 holdout test samples.
                </p>
              </div>
            </div>
          </div>

          {/* Genuine Verified Evaluation Metrics */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-teal-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                Verified Holdout Test Evaluation (1,000 Samples)
              </h4>
              <span className="text-[10px] font-mono font-medium text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                80/20 Stratified Split
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3 text-center">
              <div className="bg-white p-2 rounded border border-teal-200/80">
                <span className="text-[10px] text-slate-500 block">Accuracy</span>
                <span className="font-bold text-teal-800 text-sm font-mono">
                  {evaluationData.metrics.accuracy}%
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-teal-200/80">
                <span className="text-[10px] text-slate-500 block">Precision</span>
                <span className="font-bold text-teal-800 text-sm font-mono">
                  {evaluationData.metrics.precision}%
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-teal-200/80">
                <span className="text-[10px] text-slate-500 block">Recall</span>
                <span className="font-bold text-teal-800 text-sm font-mono">
                  {evaluationData.metrics.recall}%
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-teal-200/80">
                <span className="text-[10px] text-slate-500 block">F1-Score</span>
                <span className="font-bold text-teal-800 text-sm font-mono">
                  {evaluationData.metrics.f1Score}%
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-teal-200/80 text-[11px] text-slate-700">
              <span className="font-semibold text-slate-900 block mb-1">
                Verified Confusion Matrix:
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                <div>True Positives: {evaluationData.metrics.confusionMatrix.truePositives}</div>
                <div>False Positives: {evaluationData.metrics.confusionMatrix.falsePositives}</div>
                <div>True Negatives: {evaluationData.metrics.confusionMatrix.trueNegatives}</div>
                <div>False Negatives: {evaluationData.metrics.confusionMatrix.falseNegatives}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
