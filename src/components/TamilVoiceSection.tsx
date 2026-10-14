import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, Languages, Play, Square } from 'lucide-react';

export const TamilVoiceSection: React.FC = () => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoSpokenText, setDemoSpokenText] = useState(
    'எச்சரிக்கை: நீங்கள் திறக்கவிருக்கும் இணையதள முகவரி சந்தேகத்திற்குரியதாக உள்ளது. கடவுச்சொல் மற்றும் வங்கி விவரங்களை உள்ளிட வேண்டாம்.'
  );

  const handleToggleVoicePreview = () => {
    // If Web Speech API is supported, try reading the Tamil demo text
    if (!isPlayingDemo) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(demoSpokenText);
        utterance.lang = 'ta-IN';
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlayingDemo(false);
        utterance.onerror = () => setIsPlayingDemo(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingDemo(true);
      } else {
        setIsPlayingDemo(true);
        setTimeout(() => setIsPlayingDemo(false), 3000);
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingDemo(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  Tamil Voice Assistance
                </h3>
                <span className="text-[11px] font-medium text-teal-700 block">
                  தமிழ் குரல் வழிகாட்டுதல்
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Spoken regional security advisory for non-English users
            </p>
          </div>

          <span className="text-[11px] font-semibold tracking-wide text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded shrink-0">
            Reserved
          </span>
        </div>

        {/* Feature explanation */}
        <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-md text-left mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              Regional Accessibility Focus
            </span>
            <span className="text-[10px] font-mono text-slate-400">ta-IN Native</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Designed specifically for digital banking users and rural communities.
            Translates complex technical threat indicators into plain spoken Tamil instructions
            to prevent phishing and financial fraud.
          </p>
        </div>

        {/* Voice Playback Architecture Preview */}
        <div className="border border-slate-200 rounded-md p-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Audio Advisory Preview
            </span>
            <span className="text-[10px] text-teal-700 font-medium">
              Speech Synthesis Ready
            </span>
          </div>

          {/* Tamil Transcript */}
          <p className="text-xs font-serif text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed mb-3">
            "{demoSpokenText}"
          </p>

          {/* Audio trigger button */}
          <button
            type="button"
            onClick={handleToggleVoicePreview}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded border border-slate-200 transition-colors cursor-pointer"
          >
            {isPlayingDemo ? (
              <>
                <Square className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                <span>Stop Tamil Audio Preview</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-teal-700 fill-teal-700" />
                <span>Play Sample Tamil Voice Alert</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Integration placeholder note */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">
        <span className="flex items-center gap-1">
          <Mic className="w-3.5 h-3.5 text-slate-400" />
          Text-to-Speech Engine
        </span>
        <span className="text-slate-500 font-mono">Module Ready</span>
      </div>
    </div>
  );
};
