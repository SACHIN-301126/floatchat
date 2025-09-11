import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Languages, Headphones, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export interface VoiceLanguage {
  code: string;
  name: string;
  speechCode: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: VoiceLanguage[] = [
  { code: 'en', name: 'English', speechCode: 'en-US', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', speechCode: 'fr-FR', flag: '🇫🇷' },
  { code: 'es', name: 'Español', speechCode: 'es-ES', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', speechCode: 'de-DE', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', speechCode: 'it-IT', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', speechCode: 'pt-PT', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', speechCode: 'ru-RU', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', speechCode: 'ja-JP', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', speechCode: 'ko-KR', flag: '🇰🇷' },
  { code: 'zh', name: '中文', speechCode: 'zh-CN', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', speechCode: 'ar-SA', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', speechCode: 'hi-IN', flag: '🇮🇳' }
];

interface EnhancedVoiceSystemProps {
  onVoiceQuery: (query: string, language: string) => void;
  onTextToSpeech: (text: string, language: string) => void;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  isListening?: boolean;
  isSpeaking?: boolean;
  autoSpeak?: boolean;
  onAutoSpeakChange?: (enabled: boolean) => void;
  className?: string;
}

// Type declarations for Speech APIs
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor;
    webkitSpeechRecognition: ISpeechRecognitionConstructor;
  }
}

export function EnhancedVoiceSystem({ 
  onVoiceQuery, 
  onTextToSpeech, 
  currentLanguage,
  onLanguageChange,
  isListening: externalIsListening = false,
  isSpeaking: externalIsSpeaking = false,
  autoSpeak = false,
  onAutoSpeakChange,
  className = '' 
}: EnhancedVoiceSystemProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [voiceOnlyMode, setVoiceOnlyMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isExpanded, setIsExpanded] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentLangData = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Check for browser support
  const hasVoiceSupport = (typeof window !== 'undefined') && 
    (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));
  const hasTTSSupport = (typeof window !== 'undefined') && ('speechSynthesis' in window);
  const isSecure = (typeof window !== 'undefined') && 
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost');

  useEffect(() => {
    setIsListening(externalIsListening);
  }, [externalIsListening]);

  useEffect(() => {
    setIsSpeaking(externalIsSpeaking);
  }, [externalIsSpeaking]);

  // Get available voices for the current language
  const getVoicesForLanguage = (langCode: string) => {
    if (!hasTTSSupport || typeof window === 'undefined') return [];
    try {
      const voices = window.speechSynthesis.getVoices();
      return voices.filter(voice => voice.lang.startsWith(langCode));
    } catch (err) {
      console.warn('Error getting voices:', err);
      return [];
    }
  };

  const startListening = async () => {
    if (!hasVoiceSupport || typeof window === 'undefined') {
      console.log('Voice input not available in this environment');
      return;
    }

    // Skip microphone permission checks - let browser handle this naturally

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition not available');
        return;
      }

      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLangData.speechCode;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        setTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        if (interimTranscript) {
          setTranscript(interimTranscript);
        }
        
        if (finalTranscript) {
          const cleanTranscript = finalTranscript.trim();
          setTranscript(cleanTranscript);
          onVoiceQuery(cleanTranscript, currentLanguage);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Only show critical errors, not permission-related ones
        if (event.error !== 'not-allowed' && event.error !== 'service-not-allowed') {
          setError(`Voice recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError('Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
    }
    setIsListening(false);
  };

  const speakText = (text: string, language?: string) => {
    if (!hasTTSSupport || typeof window === 'undefined') {
      setError('Text-to-speech not supported in this browser');
      return;
    }

    if (isSpeaking) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch (err) {
        console.warn('Error canceling speech:', err);
      }
      return;
    }

    // Clean text for speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/`(.*?)`/g, '$1') // Remove code markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/🚨|🌊|📊|🔍|•/g, '') // Remove emojis and bullets
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Remove multiple spaces
      .trim();

    if (!cleanText) {
      setError('No text to speak');
      return;
    }

    try {
      const targetLang = language || currentLanguage;
      const langData = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLang) || currentLangData;
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = 0.8;
      utterance.lang = langData.speechCode;

      // Try to find a native voice for the language
      const voices = getVoicesForLanguage(langData.code);
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      onTextToSpeech(cleanText, targetLang);
    } catch (err) {
      setError('Failed to speak text');
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch (err) {
        console.warn('Error stopping speech:', err);
      }
    }
  };

  // Auto-speak functionality
  useEffect(() => {
    if (autoSpeak && voiceOnlyMode) {
      // This would be triggered externally when new AI responses arrive
    }
  }, [autoSpeak, voiceOnlyMode]);

  // Clear errors after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Main Voice Control */}
      <div className="flex items-center gap-2">
        {/* Voice Input Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? 'destructive' : 'secondary'}
                size="sm"
                disabled={!hasVoiceSupport}
                className={`glow-hover transition-all duration-300 ${
                  isListening 
                    ? 'bg-coral-orange hover:bg-coral-orange-dark shadow-lg shadow-orange-500/20' 
                    : 'glass-card border-cyan-500/30 hover:border-cyan-500/50'
                }`}
              >
                <motion.div
                  animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </motion.div>
                <span className="ml-2 text-sm">
                  {isListening ? 'Listening...' : 'Voice'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isListening ? `Stop listening (${currentLangData.name})` : `Start voice input (${currentLangData.name})`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Text-to-Speech Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => speakText(transcript || 'No text to speak')}
                variant="outline"
                size="sm"
                disabled={!hasTTSSupport}
                className="glass-card border-cyan-500/30 hover:border-cyan-500/50 glow-hover"
              >
                <motion.div
                  animate={isSpeaking ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
                  transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.5 }}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSpeaking ? 'Stop speaking' : `Read aloud (${currentLangData.name})`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Language Selector */}
        <Select value={currentLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-20 glass-card border-slate-600/30">
            <SelectValue>
              <span className="text-lg">{currentLangData.flag}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="glass-card border-slate-600/30">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Settings Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Status Display */}
      <AnimatePresence>
        {(transcript || error || isListening) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2"
          >
            {isListening && (
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse">
                Listening in {currentLangData.name}...
              </Badge>
            )}
            
            {transcript && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 max-w-xs truncate">
                "{transcript}"
              </Badge>
            )}
            
            {error && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                {error}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Settings Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="glass-card p-4 space-y-4 w-80">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Voice Settings
              </h4>
              
              {/* Voice-Only Mode */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Voice-Only Mode</label>
                <Switch
                  checked={voiceOnlyMode}
                  onCheckedChange={setVoiceOnlyMode}
                />
              </div>

              {/* Auto-Speak */}
              {onAutoSpeakChange && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Auto-speak responses</label>
                  <Switch
                    checked={autoSpeak}
                    onCheckedChange={onAutoSpeakChange}
                  />
                </div>
              )}

              {/* Speech Rate */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Speech Rate: {speechRate.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Speech Pitch */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Speech Pitch: {speechPitch.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Test Voice */}
              <Button
                onClick={() => speakText(`Hello! This is a test of the ${currentLangData.name} voice system.`)}
                className="w-full"
                size="sm"
              >
                Test Voice ({currentLangData.flag} {currentLangData.name})
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}