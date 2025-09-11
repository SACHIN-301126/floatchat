import React from 'react';
import { motion } from 'motion/react';
import { Languages, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

export type Language = 'en' | 'hi' | 'ta' | 'bn';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const languageConfig = {
  en: { label: 'English', flag: '🇺🇸', code: 'EN' },
  hi: { label: 'हिन्दी', flag: '🇮🇳', code: 'HI' },
  ta: { label: 'தமிழ்', flag: '🇮🇳', code: 'TA' },
  bn: { label: 'বাংলা', flag: '🇧🇩', code: 'BN' }
};

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  const currentConfig = languageConfig[currentLanguage];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-slate-300">Language:</span>
      </div>
      
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger 
          className="w-32 glass-card border-slate-600 glow-focus"
          aria-label="Select language"
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentConfig.flag}</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                {currentConfig.code}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="glass-card border-slate-600">
          {Object.entries(languageConfig).map(([lang, config]) => (
            <SelectItem 
              key={lang} 
              value={lang}
              className="focus:bg-cyan-500/10 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{config.flag}</span>
                <div>
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-slate-400">{config.code}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}