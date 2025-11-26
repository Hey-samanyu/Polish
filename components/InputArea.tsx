import React, { useRef } from 'react';
import { SelectionState } from '../types';

interface EmailComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange: (selection: SelectionState | null) => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ value, onChange, onSelectionChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSelect = () => {
    const el = textareaRef.current;
    if (!el) return;

    if (el.selectionStart !== el.selectionEnd) {
      onSelectionChange({
        start: el.selectionStart,
        end: el.selectionEnd,
        text: el.value.substring(el.selectionStart, el.selectionEnd)
      });
    } else {
      onSelectionChange(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200">
      {/* Fake Email Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm font-medium w-16">To:</span>
          <div className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-700">
            alex@example.com
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm font-medium w-16">Subject:</span>
          <div className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-900 font-medium">
            Re: Project Update
          </div>
        </div>
      </div>

      {/* Editor Toolbar (Fake) */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-4 text-slate-400">
         <div className="flex gap-2">
           <div className="w-4 h-4 bg-slate-300 rounded"></div>
           <div className="w-4 h-4 bg-slate-300 rounded"></div>
           <div className="w-4 h-4 bg-slate-300 rounded"></div>
         </div>
         <div className="h-4 w-px bg-slate-300"></div>
         <div className="flex gap-2">
           <div className="w-4 h-4 bg-slate-300 rounded"></div>
           <div className="w-4 h-4 bg-slate-300 rounded"></div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-white group">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelect}
          // On Click also checks selection to clear it if clicked away
          onClick={handleSelect} 
          onKeyUp={handleSelect}
          placeholder="Start typing your email here... try typing something messy like 'i think we shud meet tmrw to discus the projct it is vry importnt'"
          className="w-full h-full p-6 bg-transparent text-slate-800 placeholder-slate-300 resize-none focus:outline-none text-base leading-relaxed font-normal selection:bg-emerald-100 selection:text-emerald-900"
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-300 pointer-events-none">
          Simulated Email Client
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;