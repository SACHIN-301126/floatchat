import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Waves, Settings, User, Bell, Download, Share2, Zap, LogOut, Shield, Database, BarChart3, HelpCircle, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RoleSelector, UserRole } from './RoleSelector';
import { LanguageToggle, Language } from './LanguageToggle';
import { VoiceInput } from './VoiceInput';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

interface TopNavProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onVoiceQuery: (query: string) => void;
  onTextToSpeech: (text: string) => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  user: User | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

export function TopNav({
  currentRole,
  onRoleChange,
  currentLanguage,
  onLanguageChange,
  onVoiceQuery,
  onTextToSpeech,
  isLiveMode,
  onToggleLiveMode,
  user,
  onLoginClick,
  onProfileClick,
  onLogout
}: TopNavProps) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleExport = () => {
    // Export functionality placeholder
    console.log('Exporting data...');
  };

  const handleShare = () => {
    // Share functionality placeholder
    console.log('Sharing dashboard...');
  };

  const handleAccountAction = (action: string) => {
    console.log(`Account action: ${action}`);
    setShowAccountMenu(false);
    
    switch (action) {
      case 'profile':
        onProfileClick();
        break;
      case 'logout':
        onLogout();
        break;
      default:
        console.log(`Account action: ${action}`);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="glass-card border-b border-slate-600 px-6 py-4 relative overflow-hidden">
      {/* Background Ocean Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-blue-900/5 to-cyan-900/10"></div>
      
      <div className="relative flex items-center justify-between">
        {/* Logo and Brand */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-ocean-blue to-cyan-teal rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Waves className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">FloatChat</h1>
              <div className="text-xs text-cyan-300">Ocean Analytics Platform • MoES India</div>
            </div>
          </div>
        </motion.div>

        {/* Center Controls */}
        <div className="flex items-center gap-6">
          {/* Live/Demo Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-slate-300">Data Mode:</span>
            <Button
              onClick={onToggleLiveMode}
              variant="outline"
              size="sm"
              className={`glow-hover transition-all ${
                isLiveMode
                  ? 'bg-green-500/20 text-green-300 border-green-500/30 shadow-green-500/20'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-amber-500/20'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {isLiveMode ? 'Live Data' : 'Demo Mode'}
            </Button>
          </motion.div>

          {/* Voice Input */}
          <VoiceInput
            onVoiceQuery={onVoiceQuery}
            onTextToSpeech={onTextToSpeech}
          />

          {/* Language Toggle */}
          <LanguageToggle
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>

        {/* Right Side Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {/* Role Selector */}
          <RoleSelector
            currentRole={currentRole}
            onRoleChange={onRoleChange}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 border-l border-slate-600 pl-4">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="glass-card border-cyan-500/30 hover:border-cyan-500/50 glow-hover"
              aria-label="Export data"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="glass-card border-cyan-500/30 hover:border-cyan-500/50 glow-hover"
              aria-label="Share dashboard"
            >
              <Share2 className="w-4 h-4" />
            </Button>

            {/* Notifications Popover */}
            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-card border-slate-500/30 hover:border-slate-500/50 glow-hover relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-1 -right-1 bg-coral-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">3</Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 glass-card border-slate-600/30 p-0" align="end">
                <div className="p-4 border-b border-slate-600/30">
                  <h4 className="font-semibold text-white">Notifications</h4>
                  <p className="text-sm text-slate-400">Recent updates and alerts</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-800/50 border-b border-slate-600/20">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-coral-orange rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Float #AR4902545 requires attention</p>
                        <p className="text-xs text-slate-400 mt-1">Battery level below 20%</p>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-800/50 border-b border-slate-600/20">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-teal rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">New data available for Pacific region</p>
                        <p className="text-xs text-slate-400 mt-1">145 new profiles uploaded</p>
                        <p className="text-xs text-slate-500">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-800/50">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">System maintenance completed</p>
                        <p className="text-xs text-slate-400 mt-1">All services restored</p>
                        <p className="text-xs text-slate-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-600/30">
                  <Button variant="ghost" size="sm" className="w-full text-cyan-teal hover:text-cyan-teal-light">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Account or Login */}
            {user ? (
              <Popover open={showAccountMenu} onOpenChange={setShowAccountMenu}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card border-slate-500/30 hover:border-slate-500/50 glow-hover flex items-center gap-2"
                    aria-label="Account menu"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-ocean-blue to-cyan-teal text-white text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm max-w-20 truncate">{user.name.split(' ')[0]}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 glass-card border-slate-600/30 p-0" align="end">
                  <div className="p-4 border-b border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-ocean-blue to-cyan-teal text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => handleAccountAction('profile')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile & Settings
                    </button>
                    
                    <button
                      onClick={() => handleAccountAction('data')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      Data Preferences
                    </button>
                    
                    <button
                      onClick={() => handleAccountAction('analytics')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics Dashboard
                    </button>
                    
                    <button
                      onClick={() => handleAccountAction('security')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Security & Privacy
                    </button>
                    
                    <Separator className="my-2 bg-slate-600/30" />
                    
                    <button
                      onClick={() => handleAccountAction('help')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </button>
                    
                    <button
                      onClick={() => handleAccountAction('logout')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                onClick={onLoginClick}
                variant="outline"
                size="sm"
                className="glass-card border-cyan-teal/30 hover:border-cyan-teal/50 text-cyan-teal hover:text-cyan-teal-light glow-hover"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}