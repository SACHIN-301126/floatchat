import React, { useRef, useEffect } from 'react';
import { 
  Bot,
  Globe, 
  Snowflake, 
  Sun, 
  Anchor, 
  Mountain, 
  Zap,
  MessageCircle,
  Mic,
  Languages,
  FileDown,
  Share
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const menuSections = [
    {
      title: 'ARGO Data Assistant',
      items: [
        { id: 'global', label: 'Global Ocean Overview', icon: Globe, description: 'Comprehensive worldwide ocean data analysis' },
        { id: 'polar', label: 'Polar Oceans', icon: Snowflake, description: 'Arctic and Antarctic ocean conditions' },
        { id: 'tropical', label: 'Tropical Waters', icon: Sun, description: 'Equatorial and tropical ocean analysis' },
        { id: 'deep', label: 'Deep Ocean Analysis', icon: Anchor, description: 'Abyssal and deep water investigations' },
        { id: 'enclosed', label: 'Enclosed Seas', icon: Mountain, description: 'Mediterranean, Baltic, and marginal seas' },
        { id: 'currents', label: 'Current Systems', icon: Zap, description: 'Ocean circulation and current patterns' },
      ]
    }
  ];

  // Focus management for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarRef.current?.contains(document.activeElement)) {
        // Move focus to main content when Escape is pressed
        const mainContent = document.querySelector('main');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSectionKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSectionChange(sectionId);
    }
  };

  return (
    <aside 
      ref={sidebarRef}
      className="w-full bg-slate-900 border-r border-slate-700 flex flex-col min-h-screen"
      aria-label="ARGO Data Assistant Navigation"
      role="navigation"
    >
      {/* Assistant Header */}
      <header className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-lg" aria-hidden="true">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">ARGO Data Assistant</h1>
            <p className="text-sm text-slate-400">AI-Powered Ocean Analysis</p>
          </div>
        </div>
        
        {/* Current Analysis Summary */}
        <section 
          className="bg-slate-800 rounded-lg p-4 text-sm"
          aria-labelledby="current-analysis-heading"
        >
          <h2 id="current-analysis-heading" className="sr-only">Current Analysis Summary</h2>
          <div className="text-slate-300 mb-2">
            <strong>PACIFIC OCEAN - HIGH WEATHER OVERVIEW - GPS</strong>
          </div>
          <div className="text-slate-400 mb-3">
            Surface temperature: 13.96°C<br/>
            Temperature trend shows cooling of<br/>
            42.31°C per year. Data quality is<br/>
            good.
          </div>
          
          <div className="border-t border-slate-700 pt-3">
            <div className="text-emerald-400 text-xs font-medium mb-2">● Scientific Summary</div>
            <dl className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <dt>Profiles:</dt>
                <dd className="text-white">300</dd>
              </div>
              <div className="flex justify-between">
                <dt>Trend:</dt>
                <dd className="text-blue-400">-42.31°C/yr</dd>
              </div>
              <div className="flex justify-between">
                <dt>Average:</dt>
                <dd className="text-white">13.96°C</dd>
              </div>
              <div className="flex justify-between">
                <dt>Quality:</dt>
                <dd className="text-emerald-400">93.3%</dd>
              </div>
              <div className="flex justify-between">
                <dt>SST:</dt>
                <dd className="text-white">[blank]</dd>
              </div>
              <div className="flex justify-between">
                <dt>Salinity:</dt>
                <dd className="text-white">32.25 PSU</dd>
              </div>
            </dl>
          </div>
        </section>
      </header>
      
      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-6 space-y-6" aria-label="Ocean analysis sections">
          {menuSections.map((section) => (
            <section key={section.title}>
              <h2 className="sr-only">{section.title}</h2>
              <ul className="space-y-1" role="list">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id} role="listitem">
                      <button
                        onClick={() => onSectionChange(item.id)}
                        onKeyDown={(e) => handleSectionKeyDown(e, item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900 ${
                          isActive
                            ? 'bg-slate-800 text-white border border-slate-600'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                        aria-describedby={`${item.id}-description`}
                        title={item.description}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                      <div id={`${item.id}-description`} className="sr-only">
                        {item.description}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          
          {/* Additional Analysis Tools */}
          <section className="space-y-4 mt-8" aria-labelledby="additional-tools-heading">
            <h2 id="additional-tools-heading" className="text-slate-400 text-xs">Additional Analysis Tools</h2>
            <div className="space-y-2" role="list">
              <article className="bg-slate-800 rounded p-3 text-xs" role="listitem">
                <h3 className="text-cyan-400 mb-1">Temperature Profiles</h3>
                <p className="text-slate-400">Analyze vertical temperature distribution patterns</p>
              </article>
              <article className="bg-slate-800 rounded p-3 text-xs" role="listitem">
                <h3 className="text-cyan-400 mb-1">Salinity Analysis</h3>
                <p className="text-slate-400">Deep water mass identification and tracking</p>
              </article>
              <article className="bg-slate-800 rounded p-3 text-xs" role="listitem">
                <h3 className="text-cyan-400 mb-1">Current Monitoring</h3>
                <p className="text-slate-400">Real-time ocean current analysis</p>
              </article>
              <article className="bg-slate-800 rounded p-3 text-xs" role="listitem">
                <h3 className="text-cyan-400 mb-1">Climate Indicators</h3>
                <p className="text-slate-400">Long-term ocean climate change detection</p>
              </article>
              <article className="bg-slate-800 rounded p-3 text-xs" role="listitem">
                <h3 className="text-cyan-400 mb-1">Data Quality</h3>
                <p className="text-slate-400">Comprehensive quality control metrics</p>
              </article>
            </div>
          </section>
        </nav>
      </div>
      
      {/* Bottom Controls */}
      <footer className="p-6 border-t border-slate-700 space-y-3 flex-shrink-0">
        <div className="flex gap-2" role="group" aria-label="Data export and sharing options">
          <button 
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Export current data as CSV file"
          >
            <FileDown className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
          <button 
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Share current analysis"
          >
            <Share className="w-4 h-4" aria-hidden="true" />
            Share
          </button>
        </div>
        
        <div className="text-center text-xs text-slate-500" role="status" aria-live="polite">
          Ask about ocean data trends, comparisons, and analysis
        </div>
        
        <div className="flex items-center justify-center gap-4" role="group" aria-label="Communication options">
          <button 
            className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Start voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Open chat interface"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            aria-label="Change language settings"
          >
            <Languages className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </aside>
  );
}