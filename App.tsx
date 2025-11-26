import React, { useState, useEffect } from 'react';
import EmailComposer from './components/InputArea';
import ExtensionOverlay from './components/OutputArea';
import { SelectionState } from './types';
import { SparklesIcon, CodeIcon } from './components/Icons';
import { manifestContent, backgroundContent, contentScriptContent, stylesContent } from './extension/fileContents';
import JSZip from 'jszip';

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

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder("polished-extension");
    
    if (folder) {
        folder.file("manifest.json", manifestContent);
        folder.file("background.js", finalizedBackgroundJs);
        folder.file("content.js", contentScriptContent);
        folder.file("styles.css", stylesContent);
        
        const content = await zip.generateAsync({ type: "blob" });
        const element = document.createElement('a');
        element.href = URL.createObjectURL(content);
        element.download = "polished-extension.zip";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
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
            <div className="max-w-3xl mx-auto flex flex-col items-center">
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-6">Install Your Extension</h2>
                <p className="text-slate-400 max-w-lg mx-auto mb-8">
                    We've pre-configured the extension to connect to your secure backend at:
                    <br/>
                    <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 text-sm mt-2 inline-block">{backendUrl}</code>
                </p>

                <button 
                  onClick={handleDownloadZip}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-lg rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:shadow-emerald-500/30"
                >
                  <CodeIcon className="w-6 h-6" />
                  <span>Download Extension (.zip)</span>
                </button>
              </div>
                
              <div className="w-full bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                 <h3 className="text-xl text-white font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm border border-slate-600">i</span>
                    Installation Steps
                 </h3>
                 <ol className="relative border-l border-slate-700 ml-3 space-y-8">
                     <li className="ml-6">
                        <span className="absolute -left-1.5 w-3 h-3 bg-emerald-500 rounded-full mt-1.5 ring-4 ring-slate-900"></span>
                        <h4 className="font-bold text-white text-lg mb-1">Unzip the file</h4>
                        <p className="text-slate-400">Extract the downloaded zip folder to a location you can access easily.</p>
                     </li>
                     <li className="ml-6">
                        <span className="absolute -left-1.5 w-3 h-3 bg-slate-600 rounded-full mt-1.5 ring-4 ring-slate-900"></span>
                        <h4 className="font-bold text-white text-lg mb-1">Open Extensions Menu</h4>
                        <p className="text-slate-400">
                            In Chrome, type <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">chrome://extensions</code> in the address bar.
                        </p>
                     </li>
                     <li className="ml-6">
                        <span className="absolute -left-1.5 w-3 h-3 bg-slate-600 rounded-full mt-1.5 ring-4 ring-slate-900"></span>
                        <h4 className="font-bold text-white text-lg mb-1">Load Unpacked</h4>
                        <p className="text-slate-400 mb-2">Enable <strong>Developer mode</strong> in the top right, then click the <strong>Load unpacked</strong> button.</p>
                        <p className="text-slate-400">Select the folder you just unzipped.</p>
                     </li>
                 </ol>
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

export default App;