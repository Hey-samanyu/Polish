import React, { useState } from 'react';
import EmailComposer from './components/InputArea';
import ExtensionOverlay from './components/OutputArea';
import { SelectionState } from './types';
import { SparklesIcon, LayoutDashboardIcon, CodeIcon, BarChartIcon, CreditCardIcon, ServerIcon, CheckIcon } from './components/Icons';
import { manifestContent, backgroundContent, contentScriptContent, stylesContent, serverContent } from './extension/fileContents';

const App: React.FC = () => {
  // Tabs: 'landing' | 'demo' | 'dashboard' | 'code'
  const [activeView, setActiveView] = useState<'landing' | 'demo' | 'dashboard' | 'code'>('landing');

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
            
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
                <NavButton active={activeView === 'landing'} onClick={() => setActiveView('landing')}>Product</NavButton>
                <NavButton active={activeView === 'demo'} onClick={() => setActiveView('demo')}>Live Demo</NavButton>
                <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')}>Dashboard</NavButton>
                <NavButton active={activeView === 'code'} onClick={() => setActiveView('code')}>SaaS Code</NavButton>
            </nav>

            <button onClick={() => setActiveView('dashboard')} className="md:hidden p-2 bg-slate-800 rounded-lg">
                <LayoutDashboardIcon className="w-5 h-5 text-slate-400" />
            </button>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        
        {/* VIEW: LANDING PAGE */}
        {activeView === 'landing' && (
            <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Now with Gemini 2.5 Flash
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    Make every email <br/> sound <span className="text-emerald-400">professional.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                    Polished AI is a Chrome Extension that fixes punctuation, grammar, and tone instantly inside Gmail, Outlook, and LinkedIn.
                </p>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button onClick={() => setActiveView('demo')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 shadow-xl shadow-emerald-900/20">
                        Try Interactive Demo
                    </button>
                    <button onClick={() => setActiveView('code')} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all">
                        View SaaS Architecture
                    </button>
                </div>

                {/* Social Proof */}
                <div className="mt-24 pt-12 border-t border-slate-800 w-full">
                    <p className="text-slate-500 text-sm font-medium mb-8">TRUSTED BY TEAMS AT</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                       <span className="text-2xl font-bold text-slate-300">ACME Corp</span>
                       <span className="text-2xl font-bold text-slate-300">Globex</span>
                       <span className="text-2xl font-bold text-slate-300">Soylent</span>
                       <span className="text-2xl font-bold text-slate-300">Umbrella</span>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: LIVE DEMO */}
        {activeView === 'demo' && (
          <div className="flex flex-col items-center justify-center p-4 md:p-12 min-h-full">
             <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Experience the Extension</h2>
                <p className="text-slate-400">Select text below to see how the floating polished button works.</p>
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

        {/* VIEW: DASHBOARD */}
        {activeView === 'dashboard' && (
            <div className="max-w-5xl mx-auto p-6 md:p-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                        <p className="text-slate-400">Manage your subscription and usage.</p>
                    </div>
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium">
                        Plan: Pro (Active)
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard 
                        title="Credits Remaining" 
                        value="850" 
                        total="/ 1000" 
                        icon={<SparklesIcon className="w-5 h-5 text-emerald-400"/>} 
                    />
                    <StatCard 
                        title="Words Polished" 
                        value="12.5k" 
                        total="All time" 
                        icon={<BarChartIcon className="w-5 h-5 text-blue-400"/>} 
                    />
                     <StatCard 
                        title="Next Invoice" 
                        value="$9.00" 
                        total="Due Nov 1st" 
                        icon={<CreditCardIcon className="w-5 h-5 text-purple-400"/>} 
                    />
                </div>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
                    <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-slate-700 rounded-lg"><CodeIcon className="w-5 h-5 text-white"/></div>
                         <h3 className="text-xl font-bold text-white">API Integration</h3>
                    </div>
                    <p className="text-slate-400 mb-6">
                        Use this token in your browser extension to authenticate with our servers.
                    </p>
                    <div className="flex gap-4">
                        <code className="flex-1 bg-black/30 p-4 rounded-lg border border-slate-700 font-mono text-emerald-400 text-sm overflow-hidden">
                            sk_live_51Mz92...xY72z
                        </code>
                        <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors">
                            Copy Token
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: CODE */}
        {activeView === 'code' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-900">
            <div className="max-w-5xl mx-auto">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-3">SaaS Architecture Code</h2>
                <p className="text-slate-400 max-w-2xl">
                    To scale this to thousands of users, you cannot put the Gemini Key in the extension. 
                    Instead, follow this Client-Server pattern.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pb-12">
                  {/* Column 1: Client Side */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/30 pb-2 mb-4">
                          <LayoutDashboardIcon className="w-5 h-5" />
                          <span>Client Side (The Extension)</span>
                      </div>
                      <CodeBlock filename="manifest.json" content={manifestContent} />
                      <CodeBlock filename="background.js" content={backgroundContent} description="Now sends requests to YOUR server, not Google."/>
                      <CodeBlock filename="content.js" content={contentScriptContent} />
                  </div>

                   {/* Column 2: Server Side */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-purple-500/30 pb-2 mb-4">
                          <ServerIcon className="w-5 h-5" />
                          <span>Server Side (Your Backend)</span>
                      </div>
                      <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl text-sm text-purple-200 mb-4">
                          This code runs on your cloud provider (AWS, Vercel, etc). It holds the secrets.
                      </div>
                      <CodeBlock filename="server.js" content={serverContent} description="Node.js Express server that securely calls Gemini."/>
                  </div>
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

const StatCard: React.FC<{ title: string; value: string; total: string; icon: React.ReactNode }> = ({ title, value, total, icon }) => (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
                {icon}
            </div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Month to Date</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-slate-400 text-sm font-medium">{total}</div>
    </div>
);

const CodeBlock: React.FC<{ filename: string; content: string; description?: string }> = ({ filename, content, description }) => (
  <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117] shadow-lg flex flex-col">
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
      <span className="text-sm font-mono text-emerald-400 font-semibold">{filename}</span>
      <button 
        onClick={() => navigator.clipboard.writeText(content)}
        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
      >
        Copy
      </button>
    </div>
    {description && <div className="px-4 py-2 bg-slate-800/50 text-xs text-slate-400 border-b border-slate-700/50 italic">{description}</div>}
    <div className="p-4 overflow-x-auto relative group">
      <pre className="text-xs font-mono text-slate-300 whitespace-pre font-light leading-relaxed">
        {content}
      </pre>
    </div>
  </div>
);

export default App;