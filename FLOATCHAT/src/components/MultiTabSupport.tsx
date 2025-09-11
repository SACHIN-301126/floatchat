import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Map, BarChart3, Users, Waves } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Tab {
  id: string;
  title: string;
  region: string;
  icon: React.ComponentType<{ className?: string }>;
  data?: any;
}

interface MultiTabSupportProps {
  onTabChange: (tabId: string, region: string) => void;
  children: React.ReactNode;
}

const regionIcons = {
  global: Waves,
  atlantic: Map,
  pacific: BarChart3,
  indian: Users,
  arctic: Map,
  antarctic: Waves
};

export function MultiTabSupport({ onTabChange, children }: MultiTabSupportProps) {
  const [tabs, setTabs] = useState<Tab[]>([
    { 
      id: 'global', 
      title: 'Global Ocean', 
      region: 'global', 
      icon: Waves 
    }
  ]);
  const [activeTab, setActiveTab] = useState('global');

  const regions = [
    { id: 'global', name: 'Global Ocean', icon: Waves },
    { id: 'atlantic', name: 'Atlantic', icon: Map },
    { id: 'pacific', name: 'Pacific', icon: BarChart3 },
    { id: 'indian', name: 'Indian Ocean', icon: Users },
    { id: 'arctic', name: 'Arctic', icon: Map },
    { id: 'antarctic', name: 'Antarctic', icon: Waves }
  ];

  const addTab = (region: string) => {
    const regionInfo = regions.find(r => r.id === region);
    if (!regionInfo) return;

    const newTab: Tab = {
      id: `${region}-${Date.now()}`,
      title: regionInfo.name,
      region: region,
      icon: regionInfo.icon
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    onTabChange(newTab.id, region);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return; // Keep at least one tab

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    if (activeTab === tabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      const newActiveTab = newTabs[newActiveIndex];
      setActiveTab(newActiveTab.id);
      onTabChange(newActiveTab.id, newActiveTab.region);
    }
    
    setTabs(newTabs);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      onTabChange(tabId, tab.region);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="glass-card border-b border-slate-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Ocean Analysis Workspace
          </h2>
          
          {/* Add Tab Dropdown */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-cyan-500/30 hover:border-cyan-500/50 glow-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Tab
            </Button>
            
            <div className="absolute right-0 top-full mt-2 w-48 glass-card border border-slate-600 rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {regions.map(region => {
                const Icon = region.icon;
                const hasTab = tabs.some(tab => tab.region === region.id);
                
                return (
                  <button
                    key={region.id}
                    onClick={() => !hasTab && addTab(region.id)}
                    disabled={hasTab}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                      hasTab 
                        ? 'text-slate-500 cursor-not-allowed' 
                        : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{region.name}</span>
                    {hasTab && <Badge className="ml-auto text-xs bg-slate-600">Open</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <TabsList className="bg-transparent p-0 h-auto">
              <AnimatePresence>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <TabsTrigger
                        value={tab.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.title}</span>
                        
                        {tabs.length > 1 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              closeTab(tab.id);
                            }}
                            className="ml-2 p-1 rounded hover:bg-slate-600 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            aria-label={`Close ${tab.title} tab`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                closeTab(tab.id);
                              }
                            }}
                          >
                            <X className="w-3 h-3" />
                          </div>
                        )}
                      </TabsTrigger>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}