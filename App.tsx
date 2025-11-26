import React, { useState } from 'react';
import EmailComposer from './components/InputArea';
import ExtensionOverlay from './components/OutputArea';
import { SelectionState } from './types';
import { SparklesIcon, CodeIcon, ArrowRightIcon } from './components/Icons';
import { manifestContent, backgroundContent, contentScriptContent, stylesContent } from './extension/fileContents';

const App: React.FC = () => {
  // Tabs: 'landing' | 'demo' | 'code'
  const [activeView, setActiveView] = useState<'landing' | 'demo' | 'code'>('landing');

  // --- Demo State ---
  const [emailContent, setEmailContent] = useState(
    "hey i was wonderng if u got the report i sent yesturday its kinda urgent so pls let me knw asap thanks"
  );
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);

  // --- Demo Handlers ---
  const handleSelectionChange = (newSelection: SelectionState | null) => {
    if (isExtensionOpen) return;
    if (newSelection && newSelection.text.trim().length > 0) {
      setSelection(newSelection);
    } else {
      setSelection(null);
    }
  };

  const handleOpenExtension = () => {
    if (selection) setIsExtensionOpen(true);
  };

  const handleCloseExtension = () => {
    setIsExtensionOpen(false);
  };

  const handleReplaceText = (improvedText: string) => {
    if (!selection) return;
    const before = emailContent.substring(0, selection.start);
    const after = emailContent.substring(selection.end);
    const newContent = before + improvedText + after;
    setEmailContent(newContent);
    handleCloseExtension();
    setSelection(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Navigation Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div 
              className="flex items-center gap-2 text-emerald-400 font-bold text-xl cursor-pointer"
              onClick={() => setActiveView('landing')}
            >
                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <span>Polished<span className="text-white">AI</span></span>
            </div>
            
            <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
                <NavButton active={activeView === 'landing'} onClick={() => setActiveView('landing')}>Home</NavButton>
                <NavButton active={activeView === 'demo'} onClick={() => setActiveView('demo')}>Demo</NavButton>
                <NavButton active={activeView === 'code'} onClick={() => setActiveView('code')}>Get Extension</NavButton>
            </nav>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        
        {/* VIEW: LANDING PAGE */}
        {activeView === 'landing' && (
            <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Gemini 2.5 Powered
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    Fix your grammar <br/> <span className="text-emerald-400">anywhere on the web.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                    Polished AI is a lightweight Chrome Extension. It works on Gmail, LinkedIn, Discord, and more. 
                    No subscription required—just use your own API Key.
                </p>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button onClick={() => setActiveView('demo')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 shadow-xl shadow-emerald-900/20">
                        Try Demo
                    </button>
                    <button onClick={() => setActiveView('code')} className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all">
                        <CodeIcon className="w-4 h-4" />
                        Install Extension
                    </button>
                </div>

                <div className="mt-20 w-full max-w-4xl bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-left">
                    <h3 className="text-lg font-bold text-white mb-4">How it works</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureStep 
                           step="1" 
                           title="Select Text" 
                           desc="Highlight any text input on any website." 
                        />
                        <FeatureStep 
                           step="2" 
                           title="Click Polish" 
                           desc="A magic button appears. Click it to analyze." 
                        />
                        <FeatureStep 
                           step="3" 
                           title="Replace" 
                           desc="One click to swap your messy draft for polished perfection." 
                        />
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: LIVE DEMO */}
        {activeView === 'demo' && (
          <div className="flex flex-col items-center justify-center p-4 md:p-12 min-h-full">
             <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Try the Simulator</h2>
                <p className="text-slate-400">This simulates how the extension behaves inside Gmail.</p>
             </div>
             <div className="w-full max-w-4xl h-[600px] relative">
              <EmailComposer 
                value={emailContent}
                onChange={setEmailContent}
                onSelectionChange={handleSelectionChange}
              />

              {selection && !isExtensionOpen && (
                <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 animate-fade-in-up z-20">
                  <button
                    onClick={handleOpenExtension}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-full shadow-2xl border border-emerald-500/50 hover:bg-slate-800 hover:scale-105 transition-all group"
                  >
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-1.5 rounded-full">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium pr-1">Polish Selection</span>
                  </button>
                </div>
              )}

              {isExtensionOpen && selection && (
                <ExtensionOverlay 
                  selection={selection}
                  onClose={handleCloseExtension}
                  onReplace={handleReplaceText}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW: CODE */}
        {activeView === 'code' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-900">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">Install Locally</h2>
                <p className="text-slate-400 mb-6">
                    Follow these steps to load Polished AI into your Chrome browser.
                </p>
                
                <ol className="space-y-4 text-slate-300 bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-10">
                  <li className="flex gap-3">
                    <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">1</span>
                    <span>Create a new folder on your computer named <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">polished-extension</code>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">2</span>
                    <span>Create the 4 files below inside that folder with the exact names.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">3</span>
                    <span>
                        In <code className="bg-slate-900 px-1 py-0.5 rounded text-white">background.js</code>, replace 
                        <span className="text-yellow-400 mx-1">PASTE_YOUR_GEMINI_API_KEY_HERE</span> 
                        with your actual API key.
                        <br/>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-emerald-400 underline text-sm hover:text-emerald-300">Get a free key here →</a>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">4</span>
                    <span>Open Chrome, go to <code className="bg-slate-900 px-1 py-0.5 rounded text-white">chrome://extensions</code>, enable "Developer Mode" (top right), and click "Load Unpacked". Select your folder.</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-8">
                  <CodeBlock filename="manifest.json" content={manifestContent} />
                  <CodeBlock filename="background.js" content={backgroundContent} description="IMPORTANT: Paste your API Key inside this file." highlight/>
                  <CodeBlock filename="content.js" content={contentScriptContent} />
                  <CodeBlock filename="styles.css" content={stylesContent} />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// --- Subcomponents ---

const NavButton: React.FC<{ active: boolean; children: React.ReactNode; onClick: () => void }> = ({ active, children, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            active 
            ? 'bg-slate-700 text-white shadow-lg' 
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
    >
        {children}
    </button>
);

const FeatureStep: React.FC<{ step: string; title: string; desc: string }> = ({ step, title, desc }) => (
    <div className="flex gap-4">
        <div className="text-4xl font-bold text-slate-700">{step}</div>
        <div>
            <h4 className="text-white font-bold mb-1">{title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const CodeBlock: React.FC<{ filename: string; content: string; description?: string; highlight?: boolean }> = ({ filename, content, description, highlight }) => (
  <div className={`rounded-xl overflow-hidden border bg-[#0d1117] shadow-lg flex flex-col ${highlight ? 'border-yellow-500/50 shadow-yellow-900/10' : 'border-slate-700'}`}>
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
      <span className={`text-sm font-mono font-semibold ${highlight ? 'text-yellow-400' : 'text-emerald-400'}`}>{filename}</span>
      <button 
        onClick={() => navigator.clipboard.writeText(content)}
        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
      >
        Copy
      </button>
    </div>
    {description && <div className={`px-4 py-2 text-xs border-b border-slate-700/50 font-medium ${highlight ? 'bg-yellow-500/10 text-yellow-200' : 'bg-slate-800/50 text-slate-400'}`}>{description}</div>}
    <div className="p-4 overflow-x-auto relative group">
      <pre className="text-xs font-mono text-slate-300 whitespace-pre font-light leading-relaxed">
        {content}
      </pre>
    </div>
  </div>
);

export default App;