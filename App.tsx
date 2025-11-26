import React, { useState, useEffect } from 'react';
import EmailComposer from './components/InputArea';
import ExtensionOverlay from './components/OutputArea';
import { SelectionState } from './types';
import { SparklesIcon, CodeIcon } from './components/Icons';
import { manifestContent, backgroundContent, contentScriptContent, stylesContent } from './extension/fileContents';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'landing' | 'demo' | 'download'>('landing');
  const [backendUrl, setBackendUrl] = useState<string>('');

  // Detect the deployed URL to configure the extension automatically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + '/api/polish';
      setBackendUrl(url);
    }
  }, []);

  // --- Demo State ---
  const [emailContent, setEmailContent] = useState(
    "hey i was wonderng if u got the report i sent yesturday its kinda urgent so pls let me knw asap thanks"
  );
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);

  const handleSelectionChange = (newSelection: SelectionState | null) => {
    if (isExtensionOpen) return;
    if (newSelection && newSelection.text.trim().length > 0) setSelection(newSelection);
    else setSelection(null);
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
    setEmailContent(before + improvedText + after);
    handleCloseExtension();
    setSelection(null);
  };

  // Inject real URL into the template
  const finalizedBackgroundJs = backgroundContent.replace("BACKEND_URL_PLACEHOLDER", backendUrl);

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl cursor-pointer" onClick={() => setActiveView('landing')}>
                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <span>Polished<span className="text-white">AI</span></span>
            </div>
            <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
                <NavButton active={activeView === 'landing'} onClick={() => setActiveView('landing')}>Product</NavButton>
                <NavButton active={activeView === 'demo'} onClick={() => setActiveView('demo')}>Demo</NavButton>
                <NavButton active={activeView === 'download'} onClick={() => setActiveView('download')}>Download</NavButton>
            </nav>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        
        {/* LANDING */}
        {activeView === 'landing' && (
            <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    SaaS Mode Active
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    Your AI Writing SaaS <br/> <span className="text-emerald-400">is ready.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                    This application is now configured as a SaaS. The extension connects securely to this website's backend, protecting your API key.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => setActiveView('demo')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-105">
                        Try Web Demo
                    </button>
                    <button onClick={() => setActiveView('download')} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700">
                        Download Extension
                    </button>
                </div>
            </div>
        )}

        {/* DEMO */}
        {activeView === 'demo' && (
          <div className="flex flex-col items-center justify-center p-4 md:p-12 min-h-full">
             <div className="w-full max-w-4xl h-[600px] relative">
              <EmailComposer value={emailContent} onChange={setEmailContent} onSelectionChange={handleSelectionChange} />
              {selection && !isExtensionOpen && (
                <div className="absolute bottom-12 right-12 animate-fade-in-up z-20">
                  <button onClick={handleOpenExtension} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-full shadow-2xl border border-emerald-500/50 hover:bg-slate-800 transition-all">
                    <SparklesIcon className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium pr-1">Polish Selection</span>
                  </button>
                </div>
              )}
              {isExtensionOpen && selection && (
                <ExtensionOverlay selection={selection} onClose={handleCloseExtension} onReplace={handleReplaceText} />
              )}
            </div>
          </div>
        )}

        {/* DOWNLOAD */}
        {activeView === 'download' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-900">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">Download Extension</h2>
                <p className="text-slate-400 mb-6">
                    This extension is pre-configured to connect to 
                    <code className="mx-2 bg-slate-800 px-2 py-1 rounded text-emerald-400">{backendUrl}</code>
                </p>
                
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8">
                   <h3 className="text-white font-bold mb-4">Instructions</h3>
                   <ol className="list-decimal list-inside text-slate-300 space-y-2">
                       <li>Create a folder named <code>polished-extension</code> on your computer.</li>
                       <li>Download the 4 files below into that folder.</li>
                       <li>Go to <code>chrome://extensions</code> in Chrome.</li>
                       <li>Enable "Developer Mode" and click "Load Unpacked".</li>
                   </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DownloadCard filename="manifest.json" content={manifestContent} onDownload={() => downloadFile('manifest.json', manifestContent)} />
                    <DownloadCard filename="background.js" content={finalizedBackgroundJs} onDownload={() => downloadFile('background.js', finalizedBackgroundJs)} />
                    <DownloadCard filename="content.js" content={contentScriptContent} onDownload={() => downloadFile('content.js', contentScriptContent)} />
                    <DownloadCard filename="styles.css" content={stylesContent} onDownload={() => downloadFile('styles.css', stylesContent)} />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; children: React.ReactNode; onClick: () => void }> = ({ active, children, onClick }) => (
    <button onClick={onClick} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>{children}</button>
);

const DownloadCard: React.FC<{ filename: string; content: string; onDownload: () => void }> = ({ filename, content, onDownload }) => (
  <div className="bg-[#0d1117] border border-slate-700 rounded-xl p-4 flex flex-col justify-between h-40">
      <div>
          <div className="text-emerald-400 font-mono font-bold mb-2">{filename}</div>
          <div className="text-xs text-slate-500 truncate">{content.substring(0, 100)}...</div>
      </div>
      <button onClick={onDownload} className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2">
         Download File
      </button>
  </div>
);

export default App;