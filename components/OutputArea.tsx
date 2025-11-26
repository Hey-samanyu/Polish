import React, { useEffect, useState } from 'react';
import { improveText } from '../services/geminiService';
import { ImprovementTone, SelectionState } from '../types';
import { SparklesIcon, XIcon, CheckIcon, RefreshIcon, ReplaceIcon, LoaderIcon } from './Icons';

interface ExtensionOverlayProps {
  selection: SelectionState;
  onClose: () => void;
  onReplace: (newText: string) => void;
}

const ExtensionOverlay: React.FC<ExtensionOverlayProps> = ({ selection, onClose, onReplace }) => {
  const [tone, setTone] = useState<ImprovementTone>(ImprovementTone.PROFESSIONAL);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trigger improvement when selection or tone changes
  useEffect(() => {
    let active = true;
    
    const polish = async () => {
      setIsLoading(true);
      setError(null);
      setResult('');
      try {
        const improved = await improveText(selection.text, tone);
        if (active) setResult(improved);
      } catch (err: any) {
        if (active) setError("Failed to connect.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    polish();
    return () => { active = false; };
  }, [selection.text, tone]);

  return (
    <div className="absolute top-20 right-4 w-80 md:w-96 bg-[#0f172a] rounded-xl shadow-2xl border border-slate-600 flex flex-col overflow-hidden z-50 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-500/50">
        <div className="flex items-center gap-2 text-white font-semibold">
          <SparklesIcon className="w-4 h-4" />
          <span>Polished AI</span>
        </div>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10 p-1 rounded transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        
        {/* Original Text Preview */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 block">Selected</label>
          <p className="text-slate-300 text-sm line-clamp-3 italic opacity-80">"{selection.text}"</p>
        </div>

        {/* Tone Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {Object.values(ImprovementTone).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                tone === t
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Result Area */}
        <div className="min-h-[120px] bg-slate-900 rounded-lg border border-slate-700 p-3 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
              <LoaderIcon className="w-6 h-6 animate-spin text-emerald-500" />
              <span className="text-xs">Polishing...</span>
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm text-center p-4">{error}</div>
          ) : (
            <div className="text-emerald-50 text-sm leading-relaxed animate-fade-in">
              {result}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={() => setTone(tone)} // Triggers re-run via effect
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Regenerate"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReplace(result)}
            disabled={isLoading || !result}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <ReplaceIcon className="w-4 h-4" />
            Replace Selection
          </button>
        </div>
      </div>
      
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-[10px] text-slate-500 text-center">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default ExtensionOverlay;