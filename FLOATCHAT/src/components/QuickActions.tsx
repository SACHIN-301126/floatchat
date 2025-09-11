import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Share2, 
  BookOpen, 
  Settings, 
  HelpCircle,
  RefreshCw,
  Filter,
  MessageSquare,
  BarChart3,
  Map
} from 'lucide-react';
import { Button } from './components/ui/button';

interface QuickActionsProps {
  isVisible: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  user?: any;
}

export function QuickActions({ isVisible, onClose, onAction, user }: QuickActionsProps) {
  const quickActions = [
    {
      id: 'export-data',
      name: 'Export Data',
      description: 'Download current dataset',
      icon: Download,
      color: 'text-cyan-teal',
      bgColor: 'bg-cyan-teal/20'
    },
    {
      id: 'share-analysis',
      name: 'Share Analysis',
      description: 'Share current view',
      icon: Share2,
      color: 'text-ocean-blue-light',
      bgColor: 'bg-ocean-blue/20'
    },
    {
      id: 'save-report',
      name: 'Save Report',
      description: 'Generate PDF report',
      icon: BookOpen,
      color: 'text-coral-orange',
      bgColor: 'bg-coral-orange/20'
    },
    {
      id: 'refresh-data',
      name: 'Refresh Data',
      description: 'Update with latest',
      icon: RefreshCw,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20'
    },
    {
      id: 'advanced-filters',
      name: 'Advanced Filters',
      description: 'Customize data view',
      icon: Filter,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20'
    },
    {
      id: 'ai-insights',
      name: 'AI Insights',
      description: 'Get AI analysis',
      icon: MessageSquare,
      color: 'text-cyan-teal',
      bgColor: 'bg-cyan-teal/20'
    },
    {
      id: 'data-visualization',
      name: 'Visualizations',
      description: 'Create charts',
      icon: BarChart3,
      color: 'text-ocean-blue-light',
      bgColor: 'bg-ocean-blue/20'
    },
    {
      id: 'map-view',
      name: 'Map View',
      description: 'Geographic display',
      icon: Map,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20'
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Quick Actions Panel */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="glass-card mx-4 mb-4 p-6 rounded-xl border border-slate-600/30">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-white">Quick Actions</h3>
                  <p className="text-sm text-slate-400">Streamline your ocean data workflow</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onAction(action.id);
                      onClose();
                    }}
                    className="glass-card p-4 text-left hover:bg-slate-600/20 transition-all duration-200 glow-hover group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                        <action.icon className={`w-4 h-4 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm group-hover:text-cyan-teal transition-colors">
                          {action.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* User Context Actions */}
              {user && (
                <div className="mt-6 pt-4 border-t border-slate-600/30">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Logged in as <span className="text-cyan-teal">{user.name}</span> • 
                      {user.role} access level
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction('user-settings')}
                        className="text-xs"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAction('help')}
                        className="text-xs"
                      >
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Help
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}